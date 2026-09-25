import { useData } from "@/hooks/useData";
import {
  API_ENDPOINTS,
  GC_TIME,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

/** Distinct regions for the current user's accounts. */
export function useRegions() {
  return useData({
    queryKey: QUERY_KEYS.regions,
    endpoint: API_ENDPOINTS.regions,
    staleTime: STALE_TIME.long,
    gcTime: GC_TIME.long,
  });
}
