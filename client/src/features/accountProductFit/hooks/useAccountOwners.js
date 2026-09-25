import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

/** Distinct account owners, used to populate the Account Owner filter dropdown. */
export function useAccountOwners() {
  return useData({
    queryKey: QUERY_KEYS.accountOwners,
    endpoint: API_ENDPOINTS.accountOwners,
    staleTime: STALE_TIME.long,
    gcTime: GC_TIME.long,
  });
}
