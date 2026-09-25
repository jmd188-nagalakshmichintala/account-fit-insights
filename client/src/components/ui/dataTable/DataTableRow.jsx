import { flexRender } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Renders a single TanStack row as a `<TableRow>` of `<TableCell>`s. Shared by
 * {@link TableBodyContent} (top-level rows) and any feature-specific
 * component that renders extra rows nested under a row (e.g. a topAccount's
 * child accounts), so nested rows always look and behave identically to
 * top-level ones.
 */
export function DataTableRow({ row, selectedRowId, onRowClick, className }) {
  return (
    <TableRow
      data-state={row.id === selectedRowId ? "selected" : undefined}
      className={cn(onRowClick && "cursor-pointer", className)}
      onClick={() => onRowClick?.(row.original)}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cell.column.columnDef.meta?.className}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
