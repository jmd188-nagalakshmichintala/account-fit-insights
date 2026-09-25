import dotenv from "dotenv";

dotenv.config();

// Unity Catalog catalog/schema this app reads from. Override via env vars for
// a different workspace/environment; defaults to the JMAN sandbox.
const TARGET_CATALOG = process.env.TARGET_CATALOG ?? "databricks_apps";
const TARGET_SCHEMA = process.env.TARGET_SCHEMA ?? "account_intelligence";
const TARGET_CATALOG_SCHEMA = `${TARGET_CATALOG}.${TARGET_SCHEMA}`;

/** Fully-qualified source tables. */
export const TABLES = {
  customerReporting: `${TARGET_CATALOG_SCHEMA}.account_propensity_scores`,
  customerContact: `${TARGET_CATALOG_SCHEMA}.account_contact`,
  customerAccount: `${TARGET_CATALOG_SCHEMA}.account_profile`,
  customerProductArr: `${TARGET_CATALOG_SCHEMA}.account_product_arr`,
  customerViolations: `${TARGET_CATALOG_SCHEMA}.account_compliance_violation`,
  yoyArrGrowth: `${TARGET_CATALOG_SCHEMA}.account_arr_growth`,
  accountOwners: `${TARGET_CATALOG_SCHEMA}.account_owner`,
  customerOpps: `${TARGET_CATALOG_SCHEMA}.account_opportunity`,
  accountProductReporting: `${TARGET_CATALOG_SCHEMA}.account_product_score`,
  deprioritizedAccounts: `${TARGET_CATALOG_SCHEMA}.deprioritized_account`,
};

/** Stable, unique id column used for cursor-based pagination tie-breaking. */
export const ID_COLUMN = "sf_account_id";

/** Column used to order rows when no sort is requested. */
export const DEFAULT_SORT_COLUMN = "sf_account_name";

/** Default page size for paginated queries. */
export const DEFAULT_PAGE_SIZE = 20;

/** Hard upper bound on page size to prevent unbounded/expensive scans. */
export const MAX_PAGE_SIZE = 100;

/** Whitelist mapping client sort keys → physical DB columns (prevents injection). */
export const SORT_COLUMNS = {
  accountFit: "account_fit",
  complianceAsset: "compliance_asset",
  complianceDriver: "compliance_driver",
  safety: "safety",
  potentialArr: "potential_arr",
};

/** Resolve a client sort key to a safe physical column. */
export function resolveSortColumn(sortBy) {
  return SORT_COLUMNS[sortBy] ?? DEFAULT_SORT_COLUMN;
}
