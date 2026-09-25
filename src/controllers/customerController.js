import {
  getCustomersPage,
  getCustomersPagePaginated,
  getGroupedCustomersPage,
  getProductFitSummary,
  getMaxFleetSize,
  deprioritizeCustomerAccount,
  getDeprioritizedAccounts,
  restoreCustomerAccount,
} from "../services/customerService.js";
import {
  clampPageSize,
  normalizePageNumber,
  normalizeSortOrder,
  normalizeString,
  normalizeStringList,
  normalizeBoolean,
  normalizeScoreRange,
  normalizeTrendDirection,
  roundToNiceNumber,
} from "../utils/validation.js";

function buildFiltersFromQuery(query) {
  const complianceAsset = normalizeScoreRange(
    query.complianceAssetMin,
    query.complianceAssetMax,
  );
  const complianceDriver = normalizeScoreRange(
    query.complianceDriverMin,
    query.complianceDriverMax,
  );
  const safety = normalizeScoreRange(query.safetyMin, query.safetyMax);
  const fleetSize = normalizeScoreRange(query.fleetSizeMin, query.fleetSizeMax);

  return {
    ownerEmails: normalizeStringList(query.ownerEmails),
    accountName: normalizeString(query.accountName),
    operationType: normalizeString(query.operationType),
    fleetSizeMin: fleetSize.min,
    fleetSizeMax: fleetSize.max,
    hasOpenOpportunities: normalizeBoolean(query.hasOpenOpportunities),
    isTop100Only: normalizeBoolean(query.isTop100Only),
    isProspectAccountOnly: normalizeBoolean(query.isProspectAccountOnly),
    isExistingAccountOnly: normalizeBoolean(query.isExistingAccountOnly),
    complianceAssetMin: complianceAsset.min,
    complianceAssetMax: complianceAsset.max,
    complianceDriverMin: complianceDriver.min,
    complianceDriverMax: complianceDriver.max,
    safetyMin: safety.min,
    safetyMax: safety.max,
    complianceAssetTrend: normalizeTrendDirection(query.complianceAssetTrend),
    complianceDriverTrend: normalizeTrendDirection(query.complianceDriverTrend),
    safetyTrend: normalizeTrendDirection(query.safetyTrend),
  };
}

export const getCustomers = async (req, res) => {
  const filters = buildFiltersFromQuery(req.query);

  const usePagination = req.query.page != null;

  const result = usePagination
    ? await getCustomersPagePaginated({
        page: normalizePageNumber(req.query.page),
        pageSize: clampPageSize(req.query.pageSize),
        sortBy: req.query.sortBy ?? null,
        sortOrder: normalizeSortOrder(req.query.sortOrder),
        filters,
        userId: req.user?.userId,
        email: req.user?.email,
      })
    : await getCustomersPage({
        pageSize: clampPageSize(req.query.pageSize),
        cursor: req.query.cursor ?? null,
        sortBy: req.query.sortBy ?? null,
        sortOrder: normalizeSortOrder(req.query.sortOrder),
        filters,
        userId: req.user?.userId,
        email: req.user?.email,
      });

  res.json(result);
};

/**
 * Grouped (parent + children) view: `GET /api/customers/all`. Same filters as
 * `getCustomers`, always page-paginated (each item is one topAccount group,
 * not one flat row — see {@link getGroupedCustomersPage}).
 */
export const getGroupedCustomers = async (req, res) => {
  const complianceAsset = normalizeScoreRange(
    req.query.complianceAssetMin,
    req.query.complianceAssetMax,
  );
  const complianceDriver = normalizeScoreRange(
    req.query.complianceDriverMin,
    req.query.complianceDriverMax,
  );
  const safety = normalizeScoreRange(req.query.safetyMin, req.query.safetyMax);
  const fleetSize = normalizeScoreRange(
    req.query.fleetSizeMin,
    req.query.fleetSizeMax,
  );

  const filters = {
    ownerEmails: normalizeStringList(req.query.ownerEmails),
    accountName: normalizeString(req.query.accountName),
    operationType: normalizeString(req.query.operationType),
    fleetSizeMin: fleetSize.min,
    fleetSizeMax: fleetSize.max,
    hasOpenOpportunities: normalizeBoolean(req.query.hasOpenOpportunities),
    isTop100Only: normalizeBoolean(req.query.isTop100Only),
    isProspectAccountOnly: normalizeBoolean(req.query.isProspectAccountOnly),
    isExistingAccountOnly: normalizeBoolean(req.query.isExistingAccountOnly),
    complianceAssetMin: complianceAsset.min,
    complianceAssetMax: complianceAsset.max,
    complianceDriverMin: complianceDriver.min,
    complianceDriverMax: complianceDriver.max,
    safetyMin: safety.min,
    safetyMax: safety.max,
    complianceAssetTrend: normalizeTrendDirection(
      req.query.complianceAssetTrend,
    ),
    complianceDriverTrend: normalizeTrendDirection(
      req.query.complianceDriverTrend,
    ),
    safetyTrend: normalizeTrendDirection(req.query.safetyTrend),
  };

  const result = await getGroupedCustomersPage({
    page: normalizePageNumber(req.query.page),
    pageSize: clampPageSize(req.query.pageSize),
    sortBy: req.query.sortBy ?? null,
    sortOrder: normalizeSortOrder(req.query.sortOrder),
    filters,
    userId: req.user?.userId,
    email: req.user?.email,
  });

  res.json(result);
};

export const getProductsFitSummary = async (req, res) => {
  res.json(
    await getProductFitSummary({
      filters: buildFiltersFromQuery(req.query),
      userId: req.user?.userId,
      email: req.user?.email,
    }),
  );
};

export const getFleetSizeMax = async (req, res) => {
  const maxFleetSize = await getMaxFleetSize();
  const roundedMax = roundToNiceNumber(maxFleetSize);
  res.json({ maxFleetSize: roundedMax });
};

export const deprioritizeAccount = async (req, res) => {
  const { accountId } = req.params;
  const {
    accountName,
    fleetSize,
    accountFit,
    operationType,
    ownerId,
    reason,
    deprioritizedBy,
  } = req.body;

  if (!accountId || !reason || !deprioritizedBy || !ownerId) {
    return res.status(400).json({
      error:
        "Missing required fields: accountId, reason, deprioritizedBy, or ownerId",
    });
  }

  const result = await deprioritizeCustomerAccount({
    accountId,
    accountName,
    fleetSize,
    accountFit,
    operationType,
    ownerId,
    reason,
    deprioritizedBy,
  });

  res.json(result);
};

export const getDeprioritized = async (req, res) => {
  const result = await getDeprioritizedAccounts({
    userId: req.user?.userId,
    email: req.user?.email,
    accountName: normalizeString(req.query.accountName),
  });
  res.json(result);
};

export const restoreAccount = async (req, res) => {
  const { accountId } = req.params;

  if (!accountId) {
    return res.status(400).json({
      error: "Missing required field: accountId",
    });
  }

  const result = await restoreCustomerAccount({ accountId });
  res.json(result);
};
