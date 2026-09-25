import {
  METRIC_CARDS,
  POTENTIAL_ARR_PRODUCTS,
} from "../constants/accountProductFit.constants";
import { mapProductMetadata } from "./productFitFormatting.utils";

/**
 * True when a value is effectively empty: JS null/undefined, a blank string, or
 * the literal string "null" the API sometimes returns for missing fields.
 */
export function isBlankish(value) {
  if (value == null) return true;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "" || normalized === "null";
}

export function mapAccountProductFitRows(rows = [], depth = 0) {
  return rows.map((row) => ({
    id: row.sf_account_id,
    isParent: row.is_parent === true,
    hasChild: row.has_child === true,
    depth,
    account: row.sf_account_name,
    accountFit: row.account_fit,
    operation: row.operation_type,
    isTop100: row.account_is_top_100 === true,
    isProspectAccount: row.is_prospect_account === true,
    hasParent: row.has_parent === true,
    complianceAsset: row.compliance_asset,
    complianceDriver: row.compliance_driver,
    safety: row.safety,
    complianceAssetDeltaScore:
      row.compliance_asset_delta_score == null
        ? null
        : Number(row.compliance_asset_delta_score),
    complianceDriverDeltaScore:
      row.compliance_driver_delta_score == null
        ? null
        : Number(row.compliance_driver_delta_score),
    safetyDeltaScore:
      row.safety_delta_score == null ? null : Number(row.safety_delta_score),
    complianceAssetLatestMonth: row.compliance_asset_latest_month ?? null,
    complianceDriverLatestMonth: row.compliance_driver_latest_month ?? null,
    safetyLatestMonth: row.safety_latest_month ?? null,
    complianceAssetSecondLatestMonth:
      row.compliance_asset_second_latest_month ?? null,
    complianceDriverSecondLatestMonth:
      row.compliance_driver_second_latest_month ?? null,
    safetySecondLatestMonth: row.safety_second_latest_month ?? null,
    potentialArr: row.potential_arr == null ? null : Number(row.potential_arr),
    // Rule arrays for modal display
    complianceAssetRulesFired: Array.isArray(row.top_cmp_a_rules_fired)
      ? row.top_cmp_a_rules_fired.filter((rule) => !isBlankish(rule))
      : [],
    complianceAssetRulesNotFired: Array.isArray(row.top_cmp_a_rules_not_fired)
      ? row.top_cmp_a_rules_not_fired.filter((rule) => !isBlankish(rule))
      : [],
    complianceDriverRulesFired: Array.isArray(row.top_cmp_d_rules_fired)
      ? row.top_cmp_d_rules_fired.filter((rule) => !isBlankish(rule))
      : [],
    complianceDriverRulesNotFired: Array.isArray(row.top_cmp_d_rules_not_fired)
      ? row.top_cmp_d_rules_not_fired.filter((rule) => !isBlankish(rule))
      : [],
    safetyRulesFired: Array.isArray(row.top_sf_rules_fired)
      ? row.top_sf_rules_fired.filter((rule) => !isBlankish(rule))
      : [],
    safetyRulesNotFired: Array.isArray(row.top_sf_rules_not_fired)
      ? row.top_sf_rules_not_fired.filter((rule) => !isBlankish(rule))
      : [],
    // Rule arrays explaining a score delta: "new fired" rules for an increase,
    // "new not fired" rules for a decrease, shown in the trending icon tooltip
    complianceAssetNewFiredRules: Array.isArray(
      row.compliance_asset_new_fired_rules,
    )
      ? row.compliance_asset_new_fired_rules.filter((rule) => !isBlankish(rule))
      : [],
    complianceAssetNewNotFiredRules: Array.isArray(
      row.compliance_asset_explanation_for_decrease,
    )
      ? row.compliance_asset_explanation_for_decrease.filter(
          (rule) => !isBlankish(rule),
        )
      : [],
    complianceDriverNewFiredRules: Array.isArray(
      row.compliance_driver_new_fired_rules,
    )
      ? row.compliance_driver_new_fired_rules.filter(
          (rule) => !isBlankish(rule),
        )
      : [],
    complianceDriverNewNotFiredRules: Array.isArray(
      row.compliance_driver_explanation_for_decrease,
    )
      ? row.compliance_driver_explanation_for_decrease.filter(
          (rule) => !isBlankish(rule),
        )
      : [],
    safetyNewFiredRules: Array.isArray(row.safety_new_fired_rules)
      ? row.safety_new_fired_rules.filter((rule) => !isBlankish(rule))
      : [],
    safetyNewNotFiredRules: Array.isArray(row.safety_explanation_for_decrease)
      ? row.safety_explanation_for_decrease.filter((rule) => !isBlankish(rule))
      : [],
    fleetSize: row.fleet_size == null ? null : Number(row.fleet_size),
    potentialArrBreakdown: mapPotentialArrBreakdown(row),
    aiSummary: row.ai_summary,
    // Metadata tooltips for Owned products
    complianceAssetMetadata: mapProductMetadata(row.compliance_asset_meta),
    complianceDriverMetadata: mapProductMetadata(row.compliance_driver_meta),
    safetyMetadata: mapProductMetadata(row.safety_meta),
  }));
}

/**
 * Map the grouped `/api/customers/all` response into per-group view models:
 * one mapped topAccount row plus its mapped childAccounts rows. Child rows
 * are flagged `isChildRow` so the account-name column knows to indent them —
 * the grouped payload is a fixed two-level hierarchy (topAccount + a flat
 * childAccounts list), so there's no further nesting to track.
 */
export function mapGroupedCustomerRows(items = []) {
  return items.map((item) => ({
    topAccount: mapAccountProductFitRows([item.topAccount])[0],
    childAccounts: mapAccountProductFitRows(item.childAccounts ?? []).map(
      (child) => ({ ...child, isChildRow: true }),
    ),
  }));
}

function mapPotentialArrBreakdown(row) {
  return POTENTIAL_ARR_PRODUCTS.map(({ key, label }) => {
    const rawValue = row[`potential_arr_${key}`];
    return {
      label,
      value: rawValue == null ? null : Number(rawValue),
    };
  }).filter(({ value }) => value != null && value !== 0);
}

/**
 * Map raw account-owner rows into MultiSelect filter options for the Account
 * Owner dropdown: `owner_email` is the id (sent to the backend as the filter
 * value), `owner_name` the label.
 */
export function mapAccountOwnerOptions(rows = []) {
  return rows.map((row) => ({
    id: row.owner_email,
    label: row.owner_name,
  }));
}

/**
 * Maps a filter id → the customers API query param it drives. Add an entry here
 * to support a new filter:
 *  - `owner`   → the Account Owner dropdown (array of owner emails).
 *  - `account` → the Account Name header search (a free-text string).
 *  - `openOpportunities` → the Open Opportunities dropdown (yes/no).
 */
const COLUMN_FILTER_PARAMS = {
  owner: "ownerEmails",
  account: "accountName",
  operationType: "operationType",
  openOpportunities: "hasOpenOpportunities",
};

/**
 * Translate the generic filter state (`[{ id, value }]`) into customers API
 * query params (e.g. `{ ownerEmails: [...], accountName: "acme" }`). Empty
 * values and unmapped ids are ignored. Both the customers list and the
 * product-fit summary use this, so the two stay in sync.
 */
export function mapColumnFiltersToParams(columnFilters = []) {
  const params = {};

  for (const { id, value } of columnFilters) {
    const paramKey = COLUMN_FILTER_PARAMS[id];
    if (!paramKey) continue;

    // Handle different filter types
    if (id === "openOpportunities") {
      // Only add the filter if value is true (checkbox checked)
      // null means show all accounts (no filter)
      if (value === true) params[paramKey] = "true";
    } else if (value?.length) {
      // Array or string filters (owner, account name)
      params[paramKey] = value;
    }
  }

  return params;
}

/** Build the summary metric cards from the summary API response. */
export function buildMetricCards(summary) {
  if (!summary) return [];

  return METRIC_CARDS.map(({ key, label, icon, variant }) => ({
    label,
    icon,
    variant,
    value: summary[key],
  }));
}

/**
 * Flatten the KPI endpoint payload into a
 * `{ metricKey: { mainData, additionalData } }` lookup the KPI sections can
 * index by metric key. Section grouping is dropped here because the frontend
 * already owns section layout via `KPI_SECTIONS`.
 */
export function flattenKpiData(payload) {
  const sections = payload?.data ?? {};

  return Object.values(sections)
    .flat()
    .reduce((acc, metric) => {
      acc[metric.metricKey] = {
        mainData: metric.mainData,
        additionalData: metric.additionalData ?? {},
      };
      return acc;
    }, {});
}

/**
 * Turn a metric/additionalData key into a human-readable label.
 * camelCase keys gain spaces ("totalUnsafeDriving" → "Total Unsafe Driving");
 * already-readable keys ("Compliance - Asset") pass through unchanged.
 */
export function humanizeMetricKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}
