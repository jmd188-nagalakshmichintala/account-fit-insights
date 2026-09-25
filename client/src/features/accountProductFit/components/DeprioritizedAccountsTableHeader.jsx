import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ColumnSearchFilter } from "@/components/ui/dataTable/ColumnSearchFilter";
import { DEPRIORITIZED_COLUMNS } from "../constants/dePrioritizedAccounts.constants";

const ACCOUNT_NAME_COLUMN_KEY = "sf_account_name";

export function DeprioritizedAccountsTableHeader({
  filterValue,
  onFilterChange,
}) {
  return (
    <TableHeader className="bg-pale-lavendar-blue">
      <TableRow className="bg-muted/60 hover:bg-muted/60">
        <TableHead className="w-10" />
        {DEPRIORITIZED_COLUMNS.map((column) => (
          <TableHead key={column.key}>
            <div className="flex items-center gap-2">
              {column.label}
              {column.key === ACCOUNT_NAME_COLUMN_KEY && (
                <ColumnSearchFilter
                  value={filterValue}
                  onChange={onFilterChange}
                  placeholder="Search account name or ID…"
                />
              )}
            </div>
          </TableHead>
        ))}
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
