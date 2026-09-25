import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUrlSyncedFilter } from "@/hooks/useUrlSyncedFilter";
import { FilterProvider, useFilters } from "./context/FilterContext";
import { useAccountProductFitData } from "./hooks/useAccountProductFitData";
import { FiltersBar } from "./components/FiltersBar";
import { SummarySection } from "./components/SummarySection";
import { TableSection } from "./components/TableSection";
import { DeprioritizedAccountsTable } from "./components/DeprioritizedAccountsTable";
import { Sidebar } from "./components/AccountPanelSidebar";
import { AccountDetailsPanel } from "./components/AccountPanel/AccountDetailsPanel";

function AccountProductFitPageContent({ chatOpen, onAccountPanelOpenChange }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [canFilterByOwner, setCanFilterByOwner] = useState(false);
  const filters = useFilters();

  useEffect(() => {
    onAccountPanelOpenChange?.(Boolean(selectedRow));
    return () => onAccountPanelOpenChange?.(false);
  }, [selectedRow, onAccountPanelOpenChange]);

  // Keep the two right-side panels mutually exclusive — opening Genie
  // should close the account details panel, since they'd otherwise overlap.
  useEffect(() => {
    if (chatOpen) setSelectedRow(null);
  }, [chatOpen]);

  useUrlSyncedFilter({
    columnFilters: filters.columnFilters,
    setColumnFilters: filters.setColumnFilters,
    urlParamName: "account_id",
    filterColumnId: "account",
  });

  const data = useAccountProductFitData({
    page: filters.page,
    pageSize: filters.pageSize,
    sorting: filters.sorting,
    columnFilters: filters.columnFilters,
    scoreRanges: filters.scoreRanges,
  });

  useEffect(() => {
    if (data.customers.metadata?.canFilterByOwner !== undefined) {
      setCanFilterByOwner(data.customers.metadata.canFilterByOwner);
    }
  }, [data.customers.metadata]);

  const handleRowClick = (row) =>
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));

  return (
    <main className="relative flex w-full px-6 py-3">
      <div
        className={cn(
          "min-w-0 flex-1 transition-all duration-300",
          selectedRow && "mr-[520px]",
        )}
      >
        <SummarySection
          metrics={data.metrics}
          isLoading={data.summary.isLoading}
          isError={data.summary.isError}
          error={data.summary.error}
        />

        <FiltersBar
          ownerOptions={data.ownerOptions}
          canFilterByOwner={canFilterByOwner}
        />

        <TableSection
          columns={data.columns}
          rows={data.rows}
          sorting={filters.sorting}
          onSortingChange={filters.setSorting}
          columnFilters={filters.columnFilters}
          onColumnFiltersChange={filters.setColumnFilters}
          onRowClick={handleRowClick}
          selectedRowId={selectedRow?.id}
          isGroupExpanded={data.isGroupExpanded}
          currentPage={data.customers.metadata.currentPage}
          pageSize={data.customers.metadata.pageSize}
          totalCount={data.customers.metadata.totalCount}
          onPageChange={filters.handlePageChange}
          onPageSizeChange={filters.handlePageSizeChange}
          isLoading={data.customers.isLoading}
          isError={data.customers.isError}
          error={data.customers.error}
        />

        <DeprioritizedAccountsTable />
      </div>

      <Sidebar
        isOpen={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title="Account Details"
      >
        {selectedRow && (
          <AccountDetailsPanel
            account={selectedRow}
            onClose={() => setSelectedRow(null)}
          />
        )}
      </Sidebar>
    </main>
  );
}

export function AccountProductFitPage({ chatOpen, onAccountPanelOpenChange }) {
  return (
    <FilterProvider>
      <AccountProductFitPageContent
        chatOpen={chatOpen}
        onAccountPanelOpenChange={onAccountPanelOpenChange}
      />
    </FilterProvider>
  );
}
