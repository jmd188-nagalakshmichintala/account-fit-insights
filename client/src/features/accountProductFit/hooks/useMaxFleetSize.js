import { useData } from "@/hooks/useData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";

export function useMaxFleetSize() {
  return useData({
    endpoint: API_ENDPOINTS.fleetSizeMax,
    queryKey: QUERY_KEYS.fleetSizeMax,
    select: (data) => data?.maxFleetSize ?? 10000,
    staleTime: 1000 * 60 * 60,
  });
}
