import { usePaginatedData } from "@/hooks/usePaginatedData";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";
import { mapColumnFiltersToParams } from "../utils/accountProductFit.utils";

/**
 * Grouped (parent + children) customers list, backed by `/api/customers/all`.
 * Each item in the response is `{ topAccount, childAccounts }` — pagination
 * counts topAccount groups, not flat rows.
 */
export function useGroupedCustomers({
  page = 1,
  pageSize = 10,
  sorting = [],
  columnFilters = [],
  scoreRanges = {},
} = {}) {
  return usePaginatedData({
    queryKey: QUERY_KEYS.customersGrouped,
    endpoint: API_ENDPOINTS.customersGrouped,
    page,
    pageSize,
    sorting,
    filters: {
      ...mapColumnFiltersToParams(columnFilters),
      ...scoreRanges,
    },
  });
}
