import { normalizeString } from "./validation.js";

export function parseCommonFilters(query) {
  return {
    segment: normalizeString(query.segment) || null,
    salesRep: normalizeString(query.salesRep) || null,
    region: normalizeString(query.region) || null,
    product: normalizeString(query.product) || null,
  };
}

export function parseSltViewFilters(query, includeOpenOpp = false) {
  const filters = parseCommonFilters(query);
  if (includeOpenOpp) {
    filters.hasOpenOpp = query.hasOpenOpp === "true";
  }
  return filters;
}
