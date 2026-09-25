export function buildSltViewQueryString(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.segment) queryParams.append("segment", filters.segment);
  if (filters.salesRep) queryParams.append("salesRep", filters.salesRep);
  if (filters.region) queryParams.append("region", filters.region);
  if (filters.product) queryParams.append("product", filters.product);
  if (filters.hasOpenOpp) queryParams.append("hasOpenOpp", "true");

  return queryParams.toString();
}
