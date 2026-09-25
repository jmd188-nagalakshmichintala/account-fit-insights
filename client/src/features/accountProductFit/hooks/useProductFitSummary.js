import { useData } from "@/hooks/useData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";

import { mapColumnFiltersToParams } from "../utils/accountProductFit.utils";

export function useProductFitSummary({
  columnFilters = [],
  scoreRanges = {},
} = {}) {
  const filters = {
    ...mapColumnFiltersToParams(columnFilters),
    ...scoreRanges,
  };

  return useData({
    queryKey: [...QUERY_KEYS.productFitSummary, filters],
    endpoint: API_ENDPOINTS.productFitSummary,
    params: filters,
  });
}
