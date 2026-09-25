import { PaginatedDataTable } from "@/components/ui/dataTable/PaginatedDataTable";
import { GroupChildRows } from "./GroupChildRows";

export function AccountProductFitTable({
  columns,
  rows,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  error,
  onRowClick,
  selectedRowId,
  isGroupExpanded,
  scrollHeight = "calc(100vh - 160px)",
}) {
  const renderRowDetail = (row) => {
    const childAccounts = row.original.__childAccounts;
    if (!childAccounts?.length || !isGroupExpanded?.(row.original.id)) {
      return null;
    }

    return (
      <GroupChildRows
        childAccounts={childAccounts}
        columns={columns}
        onRowClick={onRowClick}
        selectedRowId={selectedRowId}
      />
    );
  };

  return (
    <PaginatedDataTable
      columns={columns}
      data={rows}
      sorting={sorting}
      onSortingChange={onSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isError={isError}
      error={error}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
      scrollHeight={scrollHeight}
      renderRowDetail={renderRowDetail}
    />
  );
}
