import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

/**
 * Fetches summary metrics for the SLT view.
 * @param {object} filters - Optional filters { segment, salesRep, region, product }
 * @returns {object} React Query result with metrics data
 */
export function useSummaryMetrics(filters = {}) {
  return useData({
    queryKey: [...QUERY_KEYS.sltViewSummary, filters],
    endpoint: API_ENDPOINTS.SLT_VIEW_SUMMARY,
    params: filters,
    staleTime: STALE_TIME.medium,
  });
}
