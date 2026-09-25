import { useCallback, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { InfoBanner } from "./InfoBanner";
import { AccountProductFitTable } from "@/features/accountProductFit/components/AccountProductFitTable";
import { getAccountProductFitColumns } from "@/features/accountProductFit/components/accountProductFitColumns";
import { mapGroupedCustomerRows } from "@/features/accountProductFit/utils/accountProductFit.utils";

// Shared by both SLT view drilldowns (rep+bucket, score bucket).
export function AccountGroupDrilldownModal({
  open,
  onClose,
  title,
  description,
  items,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  error,
}) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const groups = useMemo(() => mapGroupedCustomerRows(items), [items]);
  const rows = useMemo(
    () =>
      groups.map((group) => ({
        ...group.topAccount,
        __childAccounts: group.childAccounts,
      })),
    [groups],
  );

  const toggleGroupExpand = useCallback((topAccountId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(topAccountId)) {
        next.delete(topAccountId);
      } else {
        next.add(topAccountId);
      }
      return next;
    });
  }, []);

  const isGroupExpanded = useCallback(
    (topAccountId) => expandedIds.has(topAccountId),
    [expandedIds],
  );

  const columns = useMemo(
    () =>
      getAccountProductFitColumns({
        isGroupExpanded,
        onToggleGroupExpand: toggleGroupExpand,
      })
        .filter((column) => column.id !== "newOpportunity")
        .map((column) =>
          column.id === "expander"
            ? column
            : { ...column, enableSorting: false, enableColumnFilter: false },
        ),
    [isGroupExpanded, toggleGroupExpand],
  );

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={1100}>
      {description && <InfoBanner>{description}</InfoBanner>}
      <AccountProductFitTable
        columns={columns}
        rows={rows}
        sorting={[]}
        columnFilters={[]}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isGroupExpanded={isGroupExpanded}
        scrollHeight="60vh"
      />
    </Modal>
  );
}
