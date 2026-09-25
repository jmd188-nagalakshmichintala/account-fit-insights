import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

export function useEngagement(accountId) {
  return useData({
    queryKey: QUERY_KEYS.engagement(accountId),
    endpoint: API_ENDPOINTS.engagement,
    params: { account_id: accountId },
    enabled: Boolean(accountId),
    staleTime: STALE_TIME.medium,
    gcTime: GC_TIME.medium,
  });
}
