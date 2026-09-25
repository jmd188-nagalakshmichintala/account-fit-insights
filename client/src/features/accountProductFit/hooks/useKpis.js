import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";
import { flattenKpiData } from "../utils/accountProductFit.utils";

export function useKpis(accountId) {
  return useData({
    queryKey: QUERY_KEYS.kpis(accountId),
    endpoint: API_ENDPOINTS.kpis,
    params: { account_id: accountId },
    enabled: Boolean(accountId),
    staleTime: STALE_TIME.medium,
    gcTime: GC_TIME.medium,
    select: flattenKpiData,
  });
}
