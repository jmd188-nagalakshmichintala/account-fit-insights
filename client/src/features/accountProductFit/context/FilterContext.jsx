import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  getColumnFilterValue,
  setColumnFilterValue,
} from "@/components/ui/dataTable/columnFilters";
import {
  DEFAULT_PAGINATION_SIZE,
  DEFAULT_PAGE_NUMBER,
} from "@/constants/pagination.constants";
import { useScoreRangeFilters } from "../hooks/useScoreRangeFilters";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [page, setPage] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGINATION_SIZE);

  const resetPage = useCallback(() => setPage(DEFAULT_PAGE_NUMBER), []);
  const { handleClearAll, ...ranges } = useScoreRangeFilters(resetPage);

  const selectedOwnerIds = getColumnFilterValue(columnFilters, "owner");
  const operationType = getColumnFilterValue(columnFilters, "operationType");
  const rawOpenOppsFilter = getColumnFilterValue(
    columnFilters,
    "openOpportunities",
  );
  const openOppsFilter =
    Array.isArray(rawOpenOppsFilter) && rawOpenOppsFilter.length === 0
      ? null
      : rawOpenOppsFilter;

  const handleOwnerChange = useCallback(
    (value) => {
      setColumnFilters((prev) => setColumnFilterValue(prev, "owner", value));
      resetPage();
    },
    [resetPage],
  );

  const handleOperationTypeChange = useCallback(
    (value) => {
      setColumnFilters((prev) =>
        setColumnFilterValue(prev, "operationType", value),
      );
      resetPage();
    },
    [resetPage],
  );

  const handleOpenOppsChange = useCallback(
    (value) => {
      setColumnFilters((prev) =>
        setColumnFilterValue(prev, "openOpportunities", value),
      );
      resetPage();
    },
    [resetPage],
  );

  const handleSortingChange = useCallback(
    (newSorting) => {
      setSorting(newSorting);
      resetPage();
    },
    [resetPage],
  );

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      setPageSize(newPageSize);
      resetPage();
    },
    [resetPage],
  );

  const handleColumnFiltersChange = useCallback(
    (newFilters) => {
      setColumnFilters(newFilters);
      resetPage();
    },
    [resetPage],
  );

  const handleClearAllFilters = useCallback(
    (maxFleetSize = 10000) => {
      setColumnFilters([]);
      handleClearAll(maxFleetSize);
      resetPage();
      setPageSize(DEFAULT_PAGINATION_SIZE);
    },
    [handleClearAll, resetPage],
  );

  const value = useMemo(
    () => ({
      sorting,
      setSorting: handleSortingChange,
      columnFilters,
      setColumnFilters: handleColumnFiltersChange,
      ...ranges,
      selectedOwnerIds,
      operationType,
      openOppsFilter,
      page,
      pageSize,
      handleOwnerChange,
      handleOperationTypeChange,
      handleOpenOppsChange,
      handlePageChange,
      handlePageSizeChange,
      handleClearAllFilters,
    }),
    [
      sorting,
      columnFilters,
      ranges,
      selectedOwnerIds,
      operationType,
      openOppsFilter,
      page,
      pageSize,
      handleSortingChange,
      handleColumnFiltersChange,
      handleOwnerChange,
      handleOperationTypeChange,
      handleOpenOppsChange,
      handlePageChange,
      handlePageSizeChange,
      handleClearAllFilters,
    ],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}
