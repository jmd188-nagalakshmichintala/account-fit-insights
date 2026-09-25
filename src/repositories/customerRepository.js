import { executeQuery } from "../db/query.js";
import { ID_COLUMN, TABLES, resolveSortColumn } from "../config.js";
import { toSqlLiteral } from "../../shared/lib/utils/sql.js";
import { decodeCursor } from "../utils/cursor.js";

const FIT_SCORE_COLUMNS = new Set([
  "compliance_asset",
  "compliance_driver",
  "safety",
]);

const NUMERIC_COLUMNS = new Set(["potential_arr"]);

const ORDINAL_SORT_COLUMNS = {
  account_fit: { High: 3, Medium: 2, Low: 1 },
};

export function buildSortExpression(dbColumn, operand = dbColumn) {
  if (FIT_SCORE_COLUMNS.has(dbColumn)) {
    return `COALESCE(CASE WHEN ${operand} = 'Owned' THEN -1 ELSE try_cast(${operand} AS DOUBLE) END, -1)`;
  }

  if (NUMERIC_COLUMNS.has(dbColumn)) {
    return `COALESCE(${operand}, 0)`;
  }

  const ranks = ORDINAL_SORT_COLUMNS[dbColumn];
  if (ranks) {
    const cases = Object.entries(ranks)
      .map(
        ([label, rank]) =>
          `WHEN ${operand} = ${toSqlLiteral(label)} THEN ${rank}`,
      )
      .join(" ");
    return `CASE ${cases} ELSE 0 END`;
  }

  return `COALESCE(${operand}, '')`;
}

function buildCursorCondition({
  cursor,
  dbColumn,
  dbColumn2,
  direction,
  direction2,
}) {
  const parsed = decodeCursor(cursor);
  if (!parsed) return null;

  const comparator = direction === "ASC" ? ">" : "<";
  const sortKey = buildSortExpression(dbColumn);
  const cursorKey = buildSortExpression(
    dbColumn,
    toSqlLiteral(parsed.sortValue),
  );
  const id = toSqlLiteral(parsed.id);

  if (dbColumn2 && parsed.sortValue2 !== undefined) {
    const comparator2 = (direction2 ?? direction) === "ASC" ? ">" : "<";
    const sortKey2 = buildSortExpression(dbColumn2);
    const cursorKey2 = buildSortExpression(
      dbColumn2,
      toSqlLiteral(parsed.sortValue2),
    );

    return `(
      ${sortKey} ${comparator} ${cursorKey}
      OR (
        ${sortKey} = ${cursorKey}
        AND ${sortKey2} ${comparator2} ${cursorKey2}
      )
      OR (
        ${sortKey} = ${cursorKey}
        AND ${sortKey2} = ${cursorKey2}
        AND ${ID_COLUMN} > ${id}
      )
    )`;
  }

  return `(
      ${sortKey} ${comparator} ${cursorKey}
      OR (
        ${sortKey} = ${cursorKey}
        AND ${ID_COLUMN} > ${id}
      )
    )`;
}

/**
 * Build the owner-email filter predicate: restrict to accounts owned by any of
 * the selected owners via the account-owners → reporting relationship
 * (account_owners.account_id = customer_reporting.sf_account_id).
 * Returns `null` when no owners are selected.
 */
function buildOwnerFilterCondition(ownerEmails = []) {
  if (!ownerEmails.length) return null;

  const emailList = ownerEmails.map(toSqlLiteral).join(", ");

  return `cr.${ID_COLUMN} IN (
      SELECT account_id
      FROM ${TABLES.accountOwners}
      WHERE owner_email IN (${emailList})
    )`;
}

/**
 * Build the account search predicate: matches by account name (substring) OR account ID (exact).
 * `contains()` prevents `%` and `_` from acting as wildcards; backslashes are doubled for Databricks.
 * `alias` is the table alias qualifying `sf_account_name`/`sf_account_id` in the calling query.
 */
function buildAccountNameFilterCondition(accountName, alias = "cr") {
  const term = String(accountName ?? "").trim();
  if (!term) return null;

  const literal = term.replace(/\\/g, "\\\\");
  const nameLiteral = toSqlLiteral(literal);
  const idLiteral = toSqlLiteral(term);

  return `(contains(lower(${alias}.sf_account_name), lower(${nameLiteral})) OR ${alias}.sf_account_id = ${idLiteral})`;
}

/**
 * Build the operation-type filter predicate: restrict to For-Hire or Private accounts.
 */
function buildOperationTypeFilterCondition(operationType) {
  if (!operationType) return null;

  return `ca.operation_type = ${toSqlLiteral(operationType)}`;
}

/**
 * Build the fleet size range filter predicate: restrict by fleet size range.
 */
function buildFleetSizeRangeFilterCondition(min, max, alias = "cr") {
  if (min == null || max == null) return null;

  return `COALESCE(${alias}.fleet_size, 0) BETWEEN ${toSqlLiteral(Number(min))} AND ${toSqlLiteral(Number(max))}`;
}

/**
 * Build the open-opportunities filter predicate: restrict to accounts with
 * open opportunities (is_closed = false) in the account_opportunity table.
 */
function buildOpenOpportunitiesFilterCondition(hasOpenOpportunities) {
  if (hasOpenOpportunities !== true) return null;

  return `EXISTS (
      SELECT 1
      FROM ${TABLES.customerOpps} opps
      WHERE opps.sf_account_id = cr.${ID_COLUMN}
        AND opps.is_closed = false
    )`;
}

/**
 * Build score range filter predicate for compliance/safety scores.
 * Filters rows where the score is within [min, max], treating 'Owned' as -1
 * (consistent with buildSortExpression).
 */
function buildScoreRangeFilterCondition(column, min, max, alias = "cr") {
  if (min == null || max == null) return null;

  const scoreValue = `COALESCE(CASE WHEN ${alias}.${column} = 'Owned' THEN -1 ELSE try_cast(${alias}.${column} AS DOUBLE) END, 0)`;
  return `${scoreValue} BETWEEN ${toSqlLiteral(Number(min))} AND ${toSqlLiteral(Number(max))}`;
}

function buildTrendFilterCondition(deltaScoreColumn, direction) {
  if (direction !== "up" && direction !== "down") return null;

  const comparator = direction === "up" ? ">" : "<";
  return `cr.${deltaScoreColumn} ${comparator} 0`;
}

/**
 * Build the top 100 customers filter predicate: restrict to accounts where
 * is_top_100 = true in the customer_account table.
 */
function buildTop100FilterCondition(isTop100Only) {
  if (isTop100Only !== true) return null;

  return `ca.is_top_100 = true`;
}

/**
 * Build the prospect accounts filter predicate: restrict to accounts where
 * is_prospect_account = true in the customer_account table.
 */
function buildProspectAccountFilterCondition(isProspectAccountOnly) {
  if (isProspectAccountOnly !== true) return null;

  return `cr.is_prospect_account = true`;
}

/**
 * Build the existing accounts filter predicate: restrict to accounts where
 * is_prospect_account = false in the customer_account table.
 */
function buildExistingAccountFilterCondition(isExistingAccountOnly) {
  if (isExistingAccountOnly !== true) return null;

  return `cr.is_prospect_account = false`;
}

/**
 * Build the user hierarchy filter predicate: restrict to accounts the user has
 * access to based on their position in the account owner hierarchy.
 * `allowedAccountIds === null` means the user isn't in the hierarchy at all and
 * gets unrestricted access, so no filter is applied. An empty array means the
 * user has no access, so every row is excluded.
 */
function buildUserHierarchyFilterCondition(allowedAccountIds = []) {
  if (allowedAccountIds === null) return null;
  if (!allowedAccountIds.length) return "FALSE";

  const idList = allowedAccountIds.map(toSqlLiteral).join(", ");

  return `cr.${ID_COLUMN} IN (${idList})`;
}

/**
 * Build the is_deprioritized filter predicate: exclude accounts that have been
 * marked as deprioritized (is_deprioritized = true).
 */
function buildDeprioritizedFilterCondition() {
  return `cr.is_deprioritized = false`;
}

/**
 * Build the parent/child scope filter predicate. By default restricts the
 * result set to top-level (parent) accounts (is_parent = true); when a
 * `parentId` is supplied, scopes instead to that parent's child accounts
 * (ultimate_parent_id_c = parentId).
 */
function buildParentScopeFilterCondition(parentId) {
  if (parentId) {
    return `cr.ultimate_parent_id_c = ${toSqlLiteral(parentId)}`;
  }

  return `cr.is_parent = true`;
}

/**
 * Build the list of filter predicates shared by the customers list and the
 * product-fit summary, so the two can never drift out of sync. Excludes
 * pagination/sort predicates — those are list-only concerns and irrelevant to
 * aggregates. Returns an array (possibly empty) of SQL condition strings.
 *
 * `includeParentScope` is false for the product-fit summary: that aggregate
 * spans every account (parent and child alike), not just top-level parents.
 */
function buildFilterConditions(
  filters = {},
  { includeParentScope = true } = {},
) {
  return [
    includeParentScope
      ? buildParentScopeFilterCondition(filters.parentId)
      : null,
    buildUserHierarchyFilterCondition(filters.allowedAccountIds),
    buildOwnerFilterCondition(filters.ownerEmails),
    buildAccountNameFilterCondition(filters.accountName),
    buildOperationTypeFilterCondition(filters.operationType),
    buildFleetSizeRangeFilterCondition(
      filters.fleetSizeMin,
      filters.fleetSizeMax,
    ),
    buildOpenOpportunitiesFilterCondition(filters.hasOpenOpportunities),
    buildTop100FilterCondition(filters.isTop100Only),
    buildProspectAccountFilterCondition(filters.isProspectAccountOnly),
    buildExistingAccountFilterCondition(filters.isExistingAccountOnly),
    buildScoreRangeFilterCondition(
      "compliance_asset",
      filters.complianceAssetMin,
      filters.complianceAssetMax,
    ),
    buildScoreRangeFilterCondition(
      "compliance_driver",
      filters.complianceDriverMin,
      filters.complianceDriverMax,
    ),
    buildScoreRangeFilterCondition(
      "safety",
      filters.safetyMin,
      filters.safetyMax,
    ),
    buildTrendFilterCondition(
      "compliance_asset_delta_score",
      filters.complianceAssetTrend,
    ),
    buildTrendFilterCondition(
      "compliance_driver_delta_score",
      filters.complianceDriverTrend,
    ),
    buildTrendFilterCondition("safety_delta_score", filters.safetyTrend),
    buildDeprioritizedFilterCondition(),
  ].filter(Boolean);
}

/**
 * Wrap the shared filter conditions in a `WHERE` clause for the summary
 * aggregate. Returns an empty string (no filtering) when no filters are active.
 */
function buildFilterWhereClause(filters = {}) {
  const conditions = buildFilterConditions(filters, {
    includeParentScope: false,
  });

  return conditions.length ? `WHERE ${conditions.join("\n AND ")}` : "";
}

/**
 * Build the top-account scope predicate for the grouped (parent + children)
 * view: a row is a "topAccount" when it is its own ultimate parent
 * (self-referencing ultimate_parent_id_c — the normal case for the root of a
 * hierarchy), OR when has_parent = false flags it as an orphan (a data
 * correction case: its ultimate_parent_id_c doesn't resolve to a real parent,
 * so it must be surfaced as its own group rather than silently dropped or
 * mis-nested under whatever id it happens to hold).
 */
function buildTopAccountScopeCondition() {
  return `(cr.sf_account_id = cr.ultimate_parent_id_c OR cr.has_parent = false)`;
}

/**
 * Build the account-name filter predicate for the grouped view: matches the
 * same way as {@link buildAccountNameFilterCondition} (name substring or
 * exact id), but a topAccount also matches when any of its real (non-orphan)
 * children match by name or id — so searching a child's name still surfaces
 * its topAccount group.
 */
function buildTopAccountOrChildNameFilterCondition(accountName) {
  const term = String(accountName ?? "").trim();
  if (!term) return null;

  const literal = term.replace(/\\/g, "\\\\");
  const nameLiteral = toSqlLiteral(literal);
  const idLiteral = toSqlLiteral(term);

  return `(
      contains(lower(cr.sf_account_name), lower(${nameLiteral})) OR cr.sf_account_id = ${idLiteral}
      OR EXISTS (
        SELECT 1
        FROM ${TABLES.customerReporting} child
        WHERE child.ultimate_parent_id_c = cr.sf_account_id
          AND child.has_parent = true
          AND child.sf_account_id != cr.sf_account_id
          AND (
            contains(lower(child.sf_account_name), lower(${nameLiteral}))
            OR child.sf_account_id = ${idLiteral}
          )
      )
    )`;
}

/**
 * Wraps a condition on `cr` so it also matches when a real (non-orphan)
 * child of `cr` satisfies the same condition — the same fallback
 * {@link buildTopAccountOrChildNameFilterCondition} uses for name search,
 * generalized for any per-account condition string.
 */
function withChildFallback(baseCondition, childCondition) {
  return `(
      ${baseCondition}
      OR EXISTS (
        SELECT 1
        FROM ${TABLES.customerReporting} child
        WHERE child.ultimate_parent_id_c = cr.sf_account_id
          AND child.has_parent = true
          AND child.sf_account_id != cr.sf_account_id
          AND ${childCondition}
      )
    )`;
}

/** Fleet size range for the grouped view: matches the parent or a real child. */
function buildGroupedFleetSizeRangeFilterCondition(min, max) {
  const base = buildFleetSizeRangeFilterCondition(min, max);
  if (!base) return null;

  return withChildFallback(
    base,
    buildFleetSizeRangeFilterCondition(min, max, "child"),
  );
}

/** Score range for the grouped view: matches the parent or a real child. */
function buildGroupedScoreRangeFilterCondition(column, min, max) {
  const base = buildScoreRangeFilterCondition(column, min, max);
  if (!base) return null;

  return withChildFallback(
    base,
    buildScoreRangeFilterCondition(column, min, max, "child"),
  );
}

/**
 * Filter predicates for the grouped (parent + children) view. Shares every
 * predicate with {@link buildFilterConditions} except the top-account scope
 * (replaces the old is_parent-style scoping), the account-name filter, and
 * the fleet size / score range filters — those three also match via a real
 * child (see {@link buildTopAccountOrChildNameFilterCondition} and
 * {@link withChildFallback}), so a group still surfaces when only a child
 * (not the parent itself) satisfies the filter. Every other filter (owner,
 * top100, etc.) still scopes which topAccount groups appear, not which
 * children within a group do.
 */
function buildGroupedFilterConditions(filters = {}) {
  return [
    buildTopAccountScopeCondition(),
    buildUserHierarchyFilterCondition(filters.allowedAccountIds),
    buildOwnerFilterCondition(filters.ownerEmails),
    buildTopAccountOrChildNameFilterCondition(filters.accountName),
    buildOperationTypeFilterCondition(filters.operationType),
    buildGroupedFleetSizeRangeFilterCondition(
      filters.fleetSizeMin,
      filters.fleetSizeMax,
    ),
    buildOpenOpportunitiesFilterCondition(filters.hasOpenOpportunities),
    buildTop100FilterCondition(filters.isTop100Only),
    buildProspectAccountFilterCondition(filters.isProspectAccountOnly),
    buildExistingAccountFilterCondition(filters.isExistingAccountOnly),
    buildGroupedScoreRangeFilterCondition(
      "compliance_asset",
      filters.complianceAssetMin,
      filters.complianceAssetMax,
    ),
    buildGroupedScoreRangeFilterCondition(
      "compliance_driver",
      filters.complianceDriverMin,
      filters.complianceDriverMax,
    ),
    buildGroupedScoreRangeFilterCondition(
      "safety",
      filters.safetyMin,
      filters.safetyMax,
    ),
    buildTrendFilterCondition(
      "compliance_asset_delta_score",
      filters.complianceAssetTrend,
    ),
    buildTrendFilterCondition(
      "compliance_driver_delta_score",
      filters.complianceDriverTrend,
    ),
    buildTrendFilterCondition("safety_delta_score", filters.safetyTrend),
    buildDeprioritizedFilterCondition(),
  ].filter(Boolean);
}

/** True when the user has any Advanced Filters selection active (not counting hierarchy/parent scope). */
function hasActiveFilters(filters = {}) {
  return Boolean(
    filters.ownerEmails?.length ||
    filters.accountName ||
    filters.operationType ||
    filters.fleetSizeMin != null ||
    filters.fleetSizeMax != null ||
    filters.hasOpenOpportunities ||
    filters.isTop100Only ||
    filters.isProspectAccountOnly ||
    filters.isExistingAccountOnly ||
    filters.complianceAssetMin != null ||
    filters.complianceDriverMin != null ||
    filters.safetyMin != null ||
    filters.complianceAssetTrend ||
    filters.complianceDriverTrend ||
    filters.safetyTrend,
  );
}

export function fetchCustomers({
  pageSize,
  cursor,
  sortBy,
  sortOrder,
  filters = {},
}) {
  // When no sort is specified, use compliance_driver as the primary sort column.
  // Whatever the primary sort is, potential_arr is always the secondary sort
  // (DESC) so equally-ranked rows still surface the highest-ARR accounts first.
  const isDefaultSort = !sortBy;
  const primarySortColumn = isDefaultSort
    ? "compliance_driver"
    : resolveSortColumn(sortBy);
  const direction = isDefaultSort
    ? "DESC"
    : sortOrder === "asc"
      ? "ASC"
      : "DESC";
  const sortExpression = buildSortExpression(primarySortColumn);
  const isPotentialArrPrimary = primarySortColumn === "potential_arr";

  const conditions = [
    buildCursorCondition({
      cursor,
      dbColumn: primarySortColumn,
      dbColumn2: isPotentialArrPrimary ? undefined : "potential_arr",
      direction,
      direction2: "DESC",
    }),
    ...buildFilterConditions(filters),
  ].filter(Boolean);

  const whereClause = conditions.length
    ? `WHERE ${conditions.join("\n      AND ")}`
    : "";

  const orderByClause = isPotentialArrPrimary
    ? `ORDER BY
      ${sortExpression} ${direction},
      cr.sf_account_id ASC`
    : `ORDER BY
      ${sortExpression} ${direction},
      ${buildSortExpression("potential_arr")} DESC,
      cr.sf_account_id ASC`;

  const sql = `
    SELECT
      cr.*,
      ca.operation_type,
      ca.is_top_100 AS account_is_top_100,
      EXISTS (
        SELECT 1
        FROM ${TABLES.customerOpps} opps
        WHERE opps.sf_account_id = cr.sf_account_id
          AND opps.is_closed = false
      ) AS has_open_opps
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    ${whereClause}
    ${orderByClause}
    LIMIT ${pageSize}
  `;

  return executeQuery(sql);
}

export async function fetchProductFitSummary({ filters = {} } = {}) {
  const whereClause = buildFilterWhereClause(filters);

  const sql = `
    SELECT
      COUNT(*) AS total_accounts,
      COUNT(DISTINCT ooa.sf_account_id) AS open_opportunities_count,
      COALESCE(SUM(CASE WHEN cr.account_fit = 'High' THEN 1 ELSE 0 END), 0) AS high_fit_scores
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
      LEFT JOIN (
        SELECT DISTINCT sf_account_id
        FROM ${TABLES.customerOpps}
        WHERE is_closed = false
      ) ooa ON cr.sf_account_id = ooa.sf_account_id
    ${whereClause}
  `;

  const rows = await executeQuery(sql);
  return rows[0];
}

export function fetchCustomersPaginated({
  limit,
  offset,
  sortBy,
  sortOrder,
  filters = {},
}) {
  const isDefaultSort = !sortBy;
  const primarySortColumn = isDefaultSort
    ? "compliance_driver"
    : resolveSortColumn(sortBy);
  const direction = isDefaultSort
    ? "DESC"
    : sortOrder === "asc"
      ? "ASC"
      : "DESC";
  const sortExpression = buildSortExpression(primarySortColumn);
  const isPotentialArrPrimary = primarySortColumn === "potential_arr";

  const conditions = buildFilterConditions(filters);
  const whereClause = conditions.length
    ? `WHERE ${conditions.join("\n      AND ")}`
    : "";

  // potential_arr is always the secondary sort (DESC) so equally-ranked rows
  // on any primary sort/filter combination still surface the highest-ARR
  // accounts first.
  const orderByClause = isPotentialArrPrimary
    ? `ORDER BY
      ${sortExpression} ${direction},
      cr.sf_account_id ASC`
    : `ORDER BY
      ${sortExpression} ${direction},
      ${buildSortExpression("potential_arr")} DESC,
      cr.sf_account_id ASC`;

  const sql = `
    SELECT
      cr.*,
      ca.operation_type,
      ca.is_top_100 AS account_is_top_100,
      EXISTS (
        SELECT 1
        FROM ${TABLES.customerOpps} opps
        WHERE opps.sf_account_id = cr.sf_account_id
          AND opps.is_closed = false
      ) AS has_open_opps
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    ${whereClause}
    ${orderByClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return executeQuery(sql);
}

export async function fetchCustomersCount({ filters = {} } = {}) {
  const conditions = buildFilterConditions(filters);
  const whereClause = conditions.length
    ? `WHERE ${conditions.join("\n      AND ")}`
    : "";

  const sql = `
    SELECT COUNT(*) AS total_count
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    ${whereClause}
  `;

  const rows = await executeQuery(sql);
  return rows[0]?.total_count ?? 0;
}

/**
 * Fetch one page of topAccount rows for the grouped (parent + children) view.
 * Same shape/sort behavior as {@link fetchCustomersPaginated}, scoped to
 * {@link buildGroupedFilterConditions} instead — each returned row represents
 * one group, not one flat row.
 */
export function fetchTopAccountsPaginated({
  limit,
  offset,
  sortBy,
  sortOrder,
  filters = {},
}) {
  const isDefaultSort = !sortBy;
  const primarySortColumn = isDefaultSort
    ? hasActiveFilters(filters)
      ? "potential_arr"
      : "compliance_driver"
    : resolveSortColumn(sortBy);
  const direction = isDefaultSort
    ? "DESC"
    : sortOrder === "asc"
      ? "ASC"
      : "DESC";
  const sortExpression = buildSortExpression(primarySortColumn);
  const isPotentialArrPrimary = primarySortColumn === "potential_arr";

  const conditions = buildGroupedFilterConditions(filters);
  const whereClause = conditions.length
    ? `WHERE ${conditions.join("\n      AND ")}`
    : "";

  // potential_arr is always the secondary sort (DESC) so equally-ranked rows
  // on any primary sort/filter combination still surface the highest-ARR
  // accounts first.
  const orderByClause = isPotentialArrPrimary
    ? `ORDER BY
      ${sortExpression} ${direction},
      cr.sf_account_id ASC`
    : `ORDER BY
      ${sortExpression} ${direction},
      ${buildSortExpression("potential_arr")} DESC,
      cr.sf_account_id ASC`;

  const sql = `
    SELECT
      cr.*,
      ca.operation_type,
      ca.is_top_100 AS account_is_top_100,
      EXISTS (
        SELECT 1
        FROM ${TABLES.customerOpps} opps
        WHERE opps.sf_account_id = cr.sf_account_id
          AND opps.is_closed = false
      ) AS has_open_opps
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    ${whereClause}
    ${orderByClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return executeQuery(sql);
}

/** Count of topAccount groups matching the grouped-view filters (for pagination). */
export async function fetchTopAccountsCount({ filters = {} } = {}) {
  const conditions = buildGroupedFilterConditions(filters);
  const whereClause = conditions.length
    ? `WHERE ${conditions.join("\n      AND ")}`
    : "";

  const sql = `
    SELECT COUNT(*) AS total_count
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    ${whereClause}
  `;

  const rows = await executeQuery(sql);
  return rows[0]?.total_count ?? 0;
}

/**
 * Fetch every real (non-orphan) child row whose ultimate parent is one of
 * `topAccountIds`, in a single query. Only the user-hierarchy and
 * deprioritized scopes apply here (per product decision, the rest of the
 * filter set only decides which topAccount groups appear, not which children
 * within a qualifying group do). `sf_account_id NOT IN` defensively excludes
 * any topAccount's own row from ever appearing as a "child" — see the
 * self-referencing-ultimate-parent note on {@link buildTopAccountScopeCondition}.
 */
export async function fetchChildAccountsForTopAccounts(
  topAccountIds,
  filters = {},
) {
  if (!topAccountIds.length) return [];

  const idList = topAccountIds.map(toSqlLiteral).join(", ");

  const conditions = [
    `cr.ultimate_parent_id_c IN (${idList})`,
    `cr.has_parent = true`,
    `cr.sf_account_id NOT IN (${idList})`,
    buildUserHierarchyFilterCondition(filters.allowedAccountIds),
    buildDeprioritizedFilterCondition(),
  ].filter(Boolean);

  const sql = `
    SELECT
      cr.*,
      ca.operation_type,
      ca.is_top_100 AS account_is_top_100,
      EXISTS (
        SELECT 1
        FROM ${TABLES.customerOpps} opps
        WHERE opps.sf_account_id = cr.sf_account_id
          AND opps.is_closed = false
      ) AS has_open_opps
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    WHERE ${conditions.join("\n      AND ")}
    ORDER BY cr.sf_account_name ASC
  `;

  return executeQuery(sql);
}

export async function fetchMaxFleetSize() {
  const sql = `
    SELECT
      MAX(COALESCE(fleet_size, 0)) AS max_fleet_size
    FROM ${TABLES.customerReporting}
  `;

  const rows = await executeQuery(sql);
  return rows[0]?.max_fleet_size ?? 0;
}

/**
 * Deprioritizes an account and cascades to its real children. All rows in
 * the batch share `deprioritized_at`, which {@link restoreAccount} uses to
 * restore the batch as a unit.
 */
export async function deprioritizeAccount({
  accountId,
  accountName,
  fleetSize,
  operationType,
  accountFit,
  ownerId,
  reason,
  deprioritizedBy,
}) {
  const now = new Date().toISOString();
  const idLiteral = toSqlLiteral(accountId);
  const reasonLiteral = toSqlLiteral(reason);
  const nowLiteral = toSqlLiteral(now);
  const deprioritizedByLiteral = toSqlLiteral(deprioritizedBy);
  const ownerIdLiteral = toSqlLiteral(ownerId);

  const insertSql = `
    INSERT INTO ${TABLES.deprioritizedAccounts}
    (sf_account_id, sf_account_name, fleet_size, account_tier, operation_type, reason, deprioritized_at, deprioritized_by, owner_id)
    VALUES (
      ${idLiteral},
      ${toSqlLiteral(accountName)},
      ${fleetSize != null ? toSqlLiteral(fleetSize) : "NULL"},
      ${toSqlLiteral(accountFit)},
      ${toSqlLiteral(operationType)},
      ${reasonLiteral},
      ${nowLiteral},
      ${deprioritizedByLiteral},
      ${ownerIdLiteral}
    )
  `;

  const insertChildrenSql = `
    INSERT INTO ${TABLES.deprioritizedAccounts}
    (sf_account_id, sf_account_name, fleet_size, account_tier, operation_type, reason, deprioritized_at, deprioritized_by, owner_id)
    SELECT
      cr.sf_account_id,
      cr.sf_account_name,
      cr.fleet_size,
      cr.account_fit,
      ca.operation_type,
      ${reasonLiteral},
      ${nowLiteral},
      ${deprioritizedByLiteral},
      ${ownerIdLiteral}
    FROM ${TABLES.customerReporting} cr
      LEFT JOIN ${TABLES.customerAccount} ca
        ON cr.sf_account_id = ca.salesforce_account_id
    WHERE cr.ultimate_parent_id_c = ${idLiteral}
      AND cr.has_parent = true
      AND cr.sf_account_id != ${idLiteral}
      AND cr.is_deprioritized = false
  `;

  await Promise.all([executeQuery(insertSql), executeQuery(insertChildrenSql)]);

  const updateSql = `
    UPDATE ${TABLES.customerReporting}
    SET is_deprioritized = true
    WHERE ${ID_COLUMN} = ${idLiteral}
  `;

  const updateChildrenSql = `
    UPDATE ${TABLES.customerReporting}
    SET is_deprioritized = true
    WHERE ultimate_parent_id_c = ${idLiteral}
      AND has_parent = true
      AND sf_account_id != ${idLiteral}
  `;

  await Promise.all([executeQuery(updateSql), executeQuery(updateChildrenSql)]);

  return { success: true };
}

/** Fetch every deprioritized account — every user has full access. */
export async function fetchDeprioritizedAccounts({ accountName } = {}) {
  const nameCondition = buildAccountNameFilterCondition(accountName, "d");
  return executeQuery(buildUnscopedDeprioritizedSql(nameCondition));
}

/** Unscoped (all accounts) deprioritized-accounts query for full-access users. */
function buildUnscopedDeprioritizedSql(nameCondition) {
  return `
    SELECT
      d.sf_account_id,
      d.sf_account_name,
      d.fleet_size,
      d.operation_type,
      d.account_tier,
      d.reason,
      d.deprioritized_at,
      d.deprioritized_by,
      cr.ultimate_parent_id_c,
      cr.has_parent,
      parent.sf_account_name AS parent_account_name
    FROM ${TABLES.deprioritizedAccounts} d
      LEFT JOIN ${TABLES.customerReporting} cr
        ON d.sf_account_id = cr.sf_account_id
      LEFT JOIN ${TABLES.customerReporting} parent
        ON cr.ultimate_parent_id_c = parent.sf_account_id
        AND cr.has_parent = true
        AND cr.ultimate_parent_id_c != cr.sf_account_id
    ${nameCondition ? `WHERE ${nameCondition}` : ""}
    ORDER BY d.deprioritized_at DESC
  `;
}

/** Restores an account and any real children currently deprioritized under it. */
export async function restoreAccount({ accountId }) {
  const idLiteral = toSqlLiteral(accountId);

  const updateSql = `
    UPDATE ${TABLES.customerReporting}
    SET is_deprioritized = false
    WHERE ${ID_COLUMN} = ${idLiteral}
  `;

  const updateChildrenSql = `
    UPDATE ${TABLES.customerReporting}
    SET is_deprioritized = false
    WHERE ultimate_parent_id_c = ${idLiteral}
      AND has_parent = true
      AND sf_account_id != ${idLiteral}
      AND is_deprioritized = true
  `;

  await Promise.all([executeQuery(updateSql), executeQuery(updateChildrenSql)]);

  const deleteSql = `
    DELETE FROM ${TABLES.deprioritizedAccounts}
    WHERE sf_account_id = ${idLiteral}
  `;

  const deleteChildrenSql = `
    DELETE FROM ${TABLES.deprioritizedAccounts}
    WHERE sf_account_id IN (
      SELECT sf_account_id
      FROM ${TABLES.customerReporting}
      WHERE ultimate_parent_id_c = ${idLiteral}
        AND has_parent = true
        AND sf_account_id != ${idLiteral}
    )
  `;

  await Promise.all([executeQuery(deleteSql), executeQuery(deleteChildrenSql)]);

  return { success: true };
}
