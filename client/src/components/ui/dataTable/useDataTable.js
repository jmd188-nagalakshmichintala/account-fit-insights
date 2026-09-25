import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

/**
 * Default row-id resolver. Tables that don't pass `getRowId` must include a
 * unique `id` on every row.
 */
function defaultGetRowId(row) {
  if (!row.id) {
    throw new Error(
      "DataTable requires a unique row id. Pass getRowId or include id in row.",
    );
  }

  return row.id;
}

/**
 * Builds the TanStack table instance for {@link DataTable}, encapsulating all
 * sorting wiring (state, change handler, manual/removal flags, sort-desc-first
 * default). Consumers stay declarative — they pass `sorting`/`onSortingChange`
 * and never touch the table internals.
 */
export function useDataTable({
  columns,
  data,
  sorting = [],
  onSortingChange,
  manualSorting = true,
  enableSortingRemoval = false,
  getRowId,
}) {
  return useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    defaultColumn: {
      sortDescFirst: true,
    },
    onSortingChange,
    manualSorting,
    enableSortingRemoval,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ?? defaultGetRowId,
  });
}
