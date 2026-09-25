import { useEffect, useMemo, useState } from "react";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { TableRow, TableBody } from "@/components/ui/table";
import {
  getColumnFilterValue,
  setColumnFilterValue,
} from "@/components/ui/dataTable/columnFilters";
import { useUrlSyncedFilter } from "@/hooks/useUrlSyncedFilter";
import { useDeprioritizedAccounts } from "../hooks/useDeprioritizedAccounts";
import { useRestoreAccount } from "@/hooks/useRestoreAccount";
import { DEPRIORITIZED_COLUMNS } from "../constants/dePrioritizedAccounts.constants";
import { groupDeprioritizedAccounts } from "../utils/deprioritizedAccounts.utils";
import { DeprioritizedAccountsTableHeader } from "./DeprioritizedAccountsTableHeader";
import { DeprioritizedAccountsTableBody } from "./DeprioritizedAccountsTableBody";
import { DeprioritizedAccountsTableSkeleton } from "./DeprioritizedAccountsTableSkeleton";

const ACCOUNT_FILTER_ID = "account";

export function DeprioritizedAccountsTable() {
  const [columnFilters, setColumnFilters] = useState([]);

  useUrlSyncedFilter({
    columnFilters,
    setColumnFilters,
    urlParamName: "account_id",
    filterColumnId: ACCOUNT_FILTER_ID,
  });

  const filterValue = getColumnFilterValue(columnFilters, ACCOUNT_FILTER_ID);
  const handleFilterChange = (value) =>
    setColumnFilters((prev) =>
      setColumnFilterValue(prev, ACCOUNT_FILTER_ID, value),
    );
  const hasSearch = typeof filterValue === "string" && filterValue.length > 0;

  const { data, isLoading, isError, error } = useDeprioritizedAccounts(
    typeof filterValue === "string" ? filterValue : "",
  );
  const restoreMutation = useRestoreAccount();

  const rows = data ?? [];
  const count = rows.length;
  const groups = useMemo(() => groupDeprioritizedAccounts(data ?? []), [data]);

  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    setExpandedIds(
      hasSearch
        ? new Set(groups.map((group) => group.topAccount.sf_account_id))
        : new Set(),
    );
  }, [groups, hasSearch]);

  const handleToggleExpand = (accountId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  };

  const handleRestore = (accountId) => {
    restoreMutation.mutate({ accountId });
  };

  if (!isLoading && !isError && !rows.length && !hasSearch) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        Deprioritized Accounts
        {!isLoading && !isError && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-600">
            {count}
          </span>
        )}
      </h2>
      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        errorTitle="Failed to load Deprioritized Accounts"
        skeleton={
          <DeprioritizedAccountsTableSkeleton
            filterValue={filterValue}
            onFilterChange={handleFilterChange}
          />
        }
      >
        <div className="rounded-lg border border-border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <DeprioritizedAccountsTableHeader
                filterValue={filterValue}
                onFilterChange={handleFilterChange}
              />
              {rows.length ? (
                <DeprioritizedAccountsTableBody
                  groups={groups}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  onRestore={handleRestore}
                  isRestoring={restoreMutation.isPending}
                />
              ) : (
                <TableBody>
                  <TableRow>
                    <td
                      colSpan={DEPRIORITIZED_COLUMNS.length + 2}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No accounts match your search.
                    </td>
                  </TableRow>
                </TableBody>
              )}
            </table>
          </div>
        </div>
      </QueryBoundary>
    </div>
  );
}
