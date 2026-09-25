import { TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { HeaderCell } from "./HeaderCell";

/**
 * Renders all header groups for the table, delegating each cell to
 * {@link HeaderCell}. Column-filter state is passed through unchanged.
 */
export function TableHeaderRow({
  table,
  stickyHeader,
  columnFilters,
  onColumnFiltersChange,
}) {
  return (
    <TableHeader
      className={cn(stickyHeader && "sticky top-0 z-20 bg-pale-lavendar-blue")}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="bg-muted/60 hover:bg-muted/60"
        >
          {headerGroup.headers.map((header) => (
            <HeaderCell
              key={header.id}
              header={header}
              columnFilters={columnFilters}
              onColumnFiltersChange={onColumnFiltersChange}
            />
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}
