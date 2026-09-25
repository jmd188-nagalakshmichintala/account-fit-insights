import { buildUrl, fetchJson } from "@/services/apiClient";
import { DEFAULT_PAGE_SIZE } from "@/constants/api.constants";

export async function fetchTableData({
  endpoint,
  pageSize = DEFAULT_PAGE_SIZE,
  cursor = null,
  sorting = [],
  filters = {},
}) {
  const [sort] = sorting;

  const payload = await fetchJson(
    buildUrl(endpoint, {
      pageSize,
      cursor,
      sortBy: sort?.id,
      sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
      ...filters,
    }),
  );

  return {
    items: payload.items ?? [],
    nextCursor: payload.nextCursor ?? null,
    hasMore: payload.hasMore ?? false,
    canFilterByOwner: payload.canFilterByOwner,
    accessLevel: payload.accessLevel,
  };
}

export async function fetchPaginatedData({
  endpoint,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  sorting = [],
  filters = {},
}) {
  const [sort] = sorting;

  const payload = await fetchJson(
    buildUrl(endpoint, {
      page,
      pageSize,
      sortBy: sort?.id,
      sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
      ...filters,
    }),
  );

  return {
    items: payload.items ?? [],
    totalCount: payload.totalCount ?? 0,
    currentPage: payload.currentPage ?? page,
    pageSize: payload.pageSize ?? pageSize,
    totalPages: payload.totalPages ?? 0,
    canFilterByOwner: payload.canFilterByOwner,
    accessLevel: payload.accessLevel,
  };
}
