import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchTableData } from "@/services/dataService";
import { DEFAULT_PAGE_SIZE, STALE_TIME } from "@/constants/api.constants";

/**
 * Generic hook for infinite-scroll / cursor-paginated GET requests.
 *
 * Use this for any endpoint that is consumed via scrolling pagination. For
 * normal one-shot GET calls use `useData` instead.
 *
 * Returns the same shape as `useInfiniteQuery` but with `data` already
 * flattened into a single array of items.
 */
export function useInfiniteData({
  queryKey,
  endpoint,
  pageSize = DEFAULT_PAGE_SIZE,
  sorting = [],
  filters = {},
  enabled = true,
  staleTime = STALE_TIME.short,
}) {
  const query = useInfiniteQuery({
    // `filters` is part of the key so changing a filter refetches from page 1,
    // and every page request carries the same sort + filters.
    queryKey: [...queryKey, pageSize, sorting, filters],
    enabled,
    staleTime,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      fetchTableData({
        endpoint,
        pageSize,
        sorting,
        filters,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const data = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const metadata = useMemo(
    () => ({
      canFilterByOwner: query.data?.pages[0]?.canFilterByOwner,
      accessLevel: query.data?.pages[0]?.accessLevel,
    }),
    [query.data],
  );

  return { ...query, data, metadata };
}
