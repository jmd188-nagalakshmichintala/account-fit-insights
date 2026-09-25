import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPaginatedData } from "@/services/dataService";
import { DEFAULT_PAGINATION_SIZE } from "@/constants/pagination.constants";
import { STALE_TIME } from "@/constants/api.constants";

export function usePaginatedData({
  queryKey,
  endpoint,
  page = 1,
  pageSize = DEFAULT_PAGINATION_SIZE,
  sorting = [],
  filters = {},
  enabled = true,
  staleTime = STALE_TIME.short,
}) {
  const query = useQuery({
    queryKey: [...queryKey, page, pageSize, sorting, filters],
    enabled,
    staleTime,
    queryFn: () =>
      fetchPaginatedData({
        endpoint,
        page,
        pageSize,
        sorting,
        filters,
      }),
  });

  const data = useMemo(() => query.data?.items ?? [], [query.data]);

  const metadata = useMemo(
    () => ({
      totalCount: query.data?.totalCount ?? 0,
      currentPage: query.data?.currentPage ?? page,
      pageSize: query.data?.pageSize ?? pageSize,
      totalPages: query.data?.totalPages ?? 0,
      canFilterByOwner: query.data?.canFilterByOwner,
      accessLevel: query.data?.accessLevel,
    }),
    [query.data, page, pageSize],
  );

  return { ...query, data, metadata };
}
