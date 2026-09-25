import { useData } from "@/hooks/useData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";

export default function useCurrentUser() {
  const { data } = useData({
    queryKey: QUERY_KEYS.currentUser,
    endpoint: API_ENDPOINTS.currentUser,
    staleTime: Infinity,
  });

  return data ?? null;
}
