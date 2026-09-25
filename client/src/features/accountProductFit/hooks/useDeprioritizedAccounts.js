import { useData } from "@/hooks/useData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";

export function useDeprioritizedAccounts(accountName) {
  return useData({
    queryKey: QUERY_KEYS.deprioritizedAccounts(accountName),
    endpoint: API_ENDPOINTS.deprioritizedAccounts,
    params: { accountName },
  });
}
