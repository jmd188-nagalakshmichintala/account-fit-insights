import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

export function useContacts(accountId) {
  return useData({
    queryKey: QUERY_KEYS.contacts(accountId),
    endpoint: API_ENDPOINTS.contacts,
    params: { account_id: accountId },
    enabled: Boolean(accountId),
    staleTime: STALE_TIME.long,
    gcTime: GC_TIME.long,
  });
}
