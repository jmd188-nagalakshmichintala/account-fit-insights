import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableRow } from "@/components/ui/dataTable/DataTableRow";

/**
 * Renders a topAccount group's child accounts directly beneath it, using the
 * same columns as the top-level table so they render identically (via the
 * shared {@link DataTableRow}). Children arrive already bundled in the
 * `/api/customers/all` response, so this is purely synchronous — no query, no
 * loading state, and no recursion: the grouped payload is a fixed two-level
 * hierarchy (a topAccount plus a flat childAccounts list).
 */
export function GroupChildRows({
  childAccounts,
  columns,
  onRowClick,
  selectedRowId,
}) {
  const table = useReactTable({
    data: childAccounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return table
    .getRowModel()
    .rows.map((row) => (
      <DataTableRow
        key={row.id}
        row={row}
        selectedRowId={selectedRowId}
        onRowClick={onRowClick}
        className="bg-muted/30"
      />
    ));
}
