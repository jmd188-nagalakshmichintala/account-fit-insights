import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

export function useAccountInfo(accountId) {
  return useData({
    queryKey: QUERY_KEYS.accountInfo(accountId),
    endpoint: API_ENDPOINTS.accountInfo,
    params: { account_id: accountId },
    enabled: Boolean(accountId),
    staleTime: STALE_TIME.medium,
    gcTime: GC_TIME.medium,
    select: (rows) => rows?.[0] ?? null,
  });
}
