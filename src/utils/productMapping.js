/**
 * Product mapping utilities for converting between product names and database columns
 */

/**
 * Maps product names (as used in filters/UI) to database column names in account_propensity_scores
 */
export const PRODUCT_COLUMN_MAPPING = {
  "Compliance - Asset": "compliance_asset",
  "Compliance - Driver": "compliance_driver",
  Safety: "safety",
};

/**
 * Maps product names to their corresponding ARR fields in the product_potential_arr struct
 */
export const PRODUCT_ARR_FIELD_MAPPING = {
  "Compliance - Asset": "compliance_asset",
  "Compliance - Driver": "compliance_driver",
  Safety: "safety",
};

/**
 * Get the database column name for a given product
 * @param {string} productName - Product name from filter/UI
 * @returns {string|null} Column name or null if not found
 */
export function getProductColumn(productName) {
  return PRODUCT_COLUMN_MAPPING[productName] || null;
}

/**
 * Get the ARR field name for a given product
 * @param {string} productName - Product name from filter/UI
 * @returns {string|null} ARR field name or null if not found
 */
export function getProductArrField(productName) {
  return PRODUCT_ARR_FIELD_MAPPING[productName] || null;
}

/**
 * Get all product column names as an array
 * @returns {string[]} Array of column names
 */
export function getAllProductColumns() {
  return Object.values(PRODUCT_COLUMN_MAPPING);
}
