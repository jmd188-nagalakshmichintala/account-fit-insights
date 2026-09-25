import { usePaginatedData } from "@/hooks/usePaginatedData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";

// Records behind one score bar (or its open/non-open segment) on the SLT view chart.
// hasOpenOpp: true (open segment) | false (non-open segment) | null (checkbox off, whole bar).
export function useScoreDistributionAccounts({
  score,
  hasOpenOpp = null,
  filters = {},
  page = 1,
  pageSize = 10,
} = {}) {
  const requestFilters = { ...filters, score, hasOpenOpp };

  return usePaginatedData({
    queryKey: QUERY_KEYS.scoreDistributionAccounts({
      score,
      hasOpenOpp,
      filters,
    }),
    endpoint: API_ENDPOINTS.scoreDistributionAccounts,
    page,
    pageSize,
    filters: requestFilters,
    enabled: Boolean(score),
  });
}
