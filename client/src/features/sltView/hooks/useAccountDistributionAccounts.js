import { usePaginatedData } from "@/hooks/usePaginatedData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";

// Records behind one bar segment (rep + high/mid/low) on the SLT view chart.
export function useAccountDistributionAccounts({
  ownerEmail,
  bucket,
  filters = {},
  page = 1,
  pageSize = 10,
} = {}) {
  const requestFilters = { ...filters, salesRep: ownerEmail, bucket };

  return usePaginatedData({
    queryKey: QUERY_KEYS.accountDistributionAccounts({
      ownerEmail,
      bucket,
      filters,
    }),
    endpoint: API_ENDPOINTS.accountDistributionAccounts,
    page,
    pageSize,
    filters: requestFilters,
    enabled: Boolean(ownerEmail && bucket),
  });
}
