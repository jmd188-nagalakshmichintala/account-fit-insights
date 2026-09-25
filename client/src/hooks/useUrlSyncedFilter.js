import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getColumnFilterValue,
  setColumnFilterValue,
} from "@/components/ui/dataTable/columnFilters";
import { cleanUrlParam } from "@/utils/urlParams";

export function useUrlSyncedFilter({
  columnFilters,
  setColumnFilters,
  urlParamName,
  filterColumnId,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const paramValue = searchParams.get(urlParamName);
    if (paramValue) {
      const cleanValue = cleanUrlParam(paramValue);
      setColumnFilters((prev) =>
        setColumnFilterValue(prev, filterColumnId, cleanValue),
      );
    }
  }, [searchParams, urlParamName, filterColumnId, setColumnFilters]);

  useEffect(() => {
    const filterValue = getColumnFilterValue(columnFilters, filterColumnId);
    const hasUrlParam = searchParams.has(urlParamName);

    if (!filterValue && hasUrlParam) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete(urlParamName);
          return newParams;
        },
        { replace: true },
      );
    }
  }, [
    columnFilters,
    filterColumnId,
    searchParams,
    setSearchParams,
    urlParamName,
  ]);
}
