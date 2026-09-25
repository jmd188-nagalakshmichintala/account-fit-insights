import { TableBody } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/dataTable/TableSkeleton";
import { DEPRIORITIZED_COLUMNS } from "../constants/dePrioritizedAccounts.constants";
import { DeprioritizedAccountsTableHeader } from "./DeprioritizedAccountsTableHeader";

export function DeprioritizedAccountsTableSkeleton({
  filterValue,
  onFilterChange,
}) {
  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <DeprioritizedAccountsTableHeader
            filterValue={filterValue}
            onFilterChange={onFilterChange}
          />
          <TableBody>
            <TableSkeleton
              columnsCount={DEPRIORITIZED_COLUMNS.length + 2}
              rowsCount={5}
            />
          </TableBody>
        </table>
      </div>
    </div>
  );
}
