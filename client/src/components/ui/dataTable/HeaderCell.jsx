import { flexRender } from "@tanstack/react-table";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { SortIndicator } from "./SortIndicator";
import { ColumnFilter } from "./ColumnFilter";
import { ColumnSearchFilter } from "./ColumnSearchFilter";
import { getColumnFilterValue, setColumnFilterValue } from "./columnFilters";

/**
 * Renders a single column header: the label, an optional sort indicator, and an
 * optional column filter.
 *
 * Sorting and filtering are driven entirely by the column definition:
 *  - `enableSorting` → header is clickable and shows a {@link SortIndicator}.
 *  - `enableColumnFilter: true` → shows a header filter. `filterMeta.type ===
 *    "search"` renders a text {@link ColumnSearchFilter}; otherwise a
 *    multi-select {@link ColumnFilter} of `filterMeta.options`.
 *
 * Filtering is controlled: the selected values come from `columnFilters` and
 * changes are emitted via `onColumnFiltersChange` (same controlled pattern as
 * sorting).
 */
export function HeaderCell({
  header,
  columnFilters = [],
  onColumnFiltersChange,
}) {
  const { column } = header;
  const canSort = column.getCanSort();
  const { enableColumnFilter, filterMeta } = column.columnDef;

  // Functional update so a debounced search commit can't clobber a filter
  // (e.g. the Account Owner selection) that changed after this render.
  const handleFilterChange = (value) =>
    onColumnFiltersChange?.((prev) =>
      setColumnFilterValue(prev, column.id, value),
    );

  return (
    <TableHead
      className={cn(canSort && "cursor-pointer select-none")}
      onClick={canSort ? column.getToggleSortingHandler() : undefined}
    >
      <div className="flex items-center gap-2">
        {flexRender(column.columnDef.header, header.getContext())}

        {canSort && <SortIndicator sortState={column.getIsSorted()} />}

        {enableColumnFilter &&
          (filterMeta?.type === "search" ? (
            <ColumnSearchFilter
              value={getColumnFilterValue(columnFilters, column.id)}
              onChange={handleFilterChange}
              placeholder={filterMeta?.placeholder}
            />
          ) : (
            <ColumnFilter
              options={filterMeta?.options ?? []}
              selectedIds={getColumnFilterValue(columnFilters, column.id)}
              onChange={handleFilterChange}
            />
          ))}
      </div>
    </TableHead>
  );
}
