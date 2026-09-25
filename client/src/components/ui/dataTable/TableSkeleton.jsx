import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Placeholder rows shown while table data loads (initial load or "load more").
 */
export function TableSkeleton({ columnsCount, rowsCount = 10 }) {
  return Array.from({ length: rowsCount }).map((_, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: columnsCount }).map((_, colIndex) => (
        <TableCell key={colIndex}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
