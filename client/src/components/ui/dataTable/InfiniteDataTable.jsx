import { useEffect, useRef } from "react";

import { StatusMessage } from "@/components/ui/StatusMessage";

import { DataTable } from "./DataTable";

/** Trigger the next page when the user scrolls within this many px of the end. */
const SCROLL_THRESHOLD_PX = 100;

export function InfiniteDataTable({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
  scrollHeight,
  sorting,
  columnFilters,
  ...tableProps
}) {
  const scrollContainerRef = useRef(null);

  // Sorting/filtering changes the React Query key, which resets the list to
  // page 1. Reset the scroll position too — otherwise the retained scrollTop
  // keeps the container near the bottom and the load-more handler below
  // cascades fetchNextPage back to the previous depth.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [sorting, columnFilters]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const remaining =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (
        remaining < SCROLL_THRESHOLD_PX &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isError) {
    return (
      <StatusMessage
        variant="error"
        title="Failed to load data"
        message={error?.message ?? "Unknown error"}
      />
    );
  }

  return (
    <DataTable
      {...tableProps}
      sorting={sorting}
      columnFilters={columnFilters}
      scrollContainerRef={scrollContainerRef}
      scrollHeight={scrollHeight}
      stickyHeader
      loadingMore={isFetchingNextPage}
      loading={isLoading && !isFetchingNextPage}
    />
  );
}
