import { Fragment } from "react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { TableSkeleton } from "./TableSkeleton";
import { DataTableRow } from "./DataTableRow";

/**
 * Renders the table body, handling the three states: initial loading
 * (skeleton), empty (message), and populated rows (with an optional
 * "load more" skeleton appended).
 */
export function TableBodyContent({
  table,
  columnsCount,
  loading = false,
  loadingMore = false,
  emptyMessage,
  onRowClick,
  selectedRowId,
  renderRowDetail,
}) {
  const rows = table.getRowModel().rows;

  if (loading) {
    return (
      <TableBody>
        <TableSkeleton columnsCount={columnsCount} rowsCount={10} />
      </TableBody>
    );
  }

  if (!rows.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={columnsCount}
            className="py-8 text-center text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <Fragment key={row.id}>
          <DataTableRow
            row={row}
            selectedRowId={selectedRowId}
            onRowClick={onRowClick}
          />
          {renderRowDetail?.(row)}
        </Fragment>
      ))}

      {loadingMore && (
        <TableSkeleton columnsCount={columnsCount} rowsCount={3} />
      )}
    </TableBody>
  );
}
