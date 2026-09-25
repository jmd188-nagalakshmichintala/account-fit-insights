import { StatusMessage } from "@/components/ui/StatusMessage";
import { AccountProductFitTable } from "./AccountProductFitTable";

export function TableSection({
  columns,
  rows,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  onRowClick,
  selectedRowId,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  error,
  isGroupExpanded,
}) {
  if (isError) {
    return (
      <StatusMessage
        variant="error"
        message={error?.message || "Failed to load account data"}
      />
    );
  }

  return (
    <AccountProductFitTable
      columns={columns}
      rows={rows}
      sorting={sorting}
      onSortingChange={onSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isGroupExpanded={isGroupExpanded}
    />
  );
}
