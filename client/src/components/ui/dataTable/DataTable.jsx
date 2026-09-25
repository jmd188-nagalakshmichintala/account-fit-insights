import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useDataTable } from "./useDataTable";
import { TableHeaderRow } from "./TableHeaderRow";
import { TableBodyContent } from "./TableBodyContent";

/**
 * Generic, presentational data table built on TanStack Table.
 *
 * Composition:
 *  - {@link useDataTable}    — builds the table instance + sorting wiring.
 *  - {@link TableHeaderRow}  — header groups, sort indicators, column filters.
 *  - {@link TableBodyContent}— loading / empty / populated body states.
 *
 * Sorting and per-column filtering are configured entirely through the column
 * definitions, so new tables get both for free (see {@link HeaderCell}).
 */
export function DataTable({
  columns,
  data,
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  getRowId,
  emptyMessage = "No records found.",
  className,
  header,
  manualSorting = true,
  onRowClick,
  scrollHeight,
  stickyHeader = true,
  scrollContainerRef,
  loadingMore = false,
  enableSortingRemoval = false,
  loading = false,
  selectedRowId,
  renderRowDetail,
}) {
  const table = useDataTable({
    columns,
    data,
    sorting,
    onSortingChange,
    manualSorting,
    enableSortingRemoval,
    getRowId,
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      {header && (
        <div className="flex items-center justify-end border-b border-border bg-transparent px-4 py-2.5">
          {header}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="overflow-auto"
        style={{ maxHeight: scrollHeight }}
      >
        <Table>
          <TableHeaderRow
            table={table}
            stickyHeader={stickyHeader}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
          />
          <TableBodyContent
            table={table}
            columnsCount={columns.length}
            loading={loading}
            loadingMore={loadingMore}
            emptyMessage={emptyMessage}
            onRowClick={onRowClick}
            selectedRowId={selectedRowId}
            renderRowDetail={renderRowDetail}
          />
        </Table>
      </div>
    </div>
  );
}
