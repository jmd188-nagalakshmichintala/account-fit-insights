import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";
import { buildSltViewQueryString } from "../utils/queryParams";

export function useAccountDistribution(filters = {}) {
  const queryString = buildSltViewQueryString(filters);
  const endpoint = queryString
    ? `${API_ENDPOINTS.accountDistribution}?${queryString}`
    : API_ENDPOINTS.accountDistribution;

  return useData({
    queryKey: QUERY_KEYS.accountDistribution(filters),
    endpoint,
    staleTime: STALE_TIME.medium,
    gcTime: GC_TIME.medium,
  });
}
