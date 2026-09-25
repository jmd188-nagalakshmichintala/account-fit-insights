import { useQuery } from "@tanstack/react-query";

import { buildUrl, fetchJson } from "@/services/apiClient";
import { STALE_TIME } from "@/constants/api.constants";

/**
 * Generic hook for normal (non-paginated) GET requests.
 *
 * Use this for every standard GET API call. For infinite-scroll / pagination
 * endpoints use `useInfiniteData` instead.
 *
 * @param {Object}   options
 * @param {Array}    options.queryKey  React Query cache key.
 * @param {string}   options.endpoint  API endpoint to fetch.
 * @param {Object}   [options.params]  Query-string params (null/undefined skipped).
 * @param {boolean}  [options.enabled]
 * @param {number}   [options.staleTime]
 * @param {number}   [options.gcTime]
 * @param {Function} [options.select]  Transform the response before returning.
 */
export function useData({
  queryKey,
  endpoint,
  params,
  enabled = true,
  staleTime = STALE_TIME.medium,
  gcTime,
  select,
}) {
  return useQuery({
    queryKey,
    queryFn: () => fetchJson(buildUrl(endpoint, params)),
    enabled,
    staleTime,
    gcTime,
    select,
  });
}
