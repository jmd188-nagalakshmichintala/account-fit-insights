import { useEffect, useRef } from "react";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Pagination } from "@/components/ui/pagination/Pagination";
import { PAGE_SIZE_OPTIONS } from "@/constants/pagination.constants";
import { DataTable } from "./DataTable";

export function PaginatedDataTable({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  error,
  scrollHeight,
  sorting,
  columnFilters,
  ...tableProps
}) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [currentPage, pageSize, sorting, columnFilters]);

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
    <div className="flex flex-col">
      <DataTable
        {...tableProps}
        sorting={sorting}
        columnFilters={columnFilters}
        scrollContainerRef={scrollContainerRef}
        scrollHeight={scrollHeight}
        stickyHeader
        loading={isLoading}
        className="rounded-b-none"
      />
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        disabled={isLoading}
      />
    </div>
  );
}
