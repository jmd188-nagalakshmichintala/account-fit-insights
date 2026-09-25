import { useCallback, useEffect, useMemo, useState } from "react";
import { useGroupedCustomers } from "./useGroupedCustomers";
import { useProductFitSummary } from "./useProductFitSummary";
import { useAccountOwners } from "./useAccountOwners";
import {
  buildMetricCards,
  mapAccountOwnerOptions,
  mapColumnFiltersToParams,
  mapGroupedCustomerRows,
} from "../utils/accountProductFit.utils";
import { getAccountProductFitColumns } from "../components/accountProductFitColumns";

export function useAccountProductFitData({
  page,
  pageSize,
  sorting,
  columnFilters,
  scoreRanges,
}) {
  const customers = useGroupedCustomers({
    page,
    pageSize,
    sorting,
    columnFilters,
    scoreRanges,
  });
  const summary = useProductFitSummary({ columnFilters, scoreRanges });
  const owners = useAccountOwners();

  const hasAccountNameFilter = Boolean(
    mapColumnFiltersToParams(columnFilters).accountName,
  );
  const hasRangeFilter = Object.keys(scoreRanges).length > 0;
  const shouldAutoExpand = hasAccountNameFilter || hasRangeFilter;

  const groups = useMemo(
    () => mapGroupedCustomerRows(customers.data),
    [customers.data],
  );

  const rows = useMemo(
    () =>
      groups.map((group) => ({
        ...group.topAccount,
        __childAccounts: group.childAccounts,
      })),
    [groups],
  );

  const [expandedIds, setExpandedIds] = useState(() => new Set());

  // Every time a new result set arrives while a name search or range/score
  // filter is active, force every returned group open — it may only appear
  // because a child (not the top account) matched. A manual collapse then
  // sticks until the next such change; with no active filter, groups
  // default back to collapsed.
  useEffect(() => {
    setExpandedIds(
      shouldAutoExpand ? new Set(rows.map((row) => row.id)) : new Set(),
    );
  }, [rows, shouldAutoExpand]);

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

  const metrics = useMemo(() => buildMetricCards(summary.data), [summary.data]);

  const columns = useMemo(
    () =>
      getAccountProductFitColumns({
        isGroupExpanded,
        onToggleGroupExpand: toggleGroupExpand,
      }),
    [isGroupExpanded, toggleGroupExpand],
  );

  const ownerOptions = useMemo(
    () => mapAccountOwnerOptions(owners.data),
    [owners.data],
  );

  const canFilterByOwner = customers.metadata?.canFilterByOwner ?? false;

  return {
    customers,
    summary,
    rows,
    metrics,
    columns,
    ownerOptions,
    canFilterByOwner,
    isGroupExpanded,
  };
}
