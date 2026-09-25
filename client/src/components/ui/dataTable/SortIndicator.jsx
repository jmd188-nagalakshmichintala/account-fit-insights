import { ArrowDown, ArrowUp } from "lucide-react";

/**
 * Renders the sort-direction arrow for a sortable column header.
 * `sortState` is the value returned by TanStack's `column.getIsSorted()`
 * ("asc" | "desc" | false).
 */
export function SortIndicator({ sortState }) {
  if (sortState === "asc") {
    return <ArrowUp size={14} className="text-primary" />;
  }

  if (sortState === "desc") {
    return <ArrowDown size={14} className="text-primary" />;
  }

  return <ArrowDown size={14} className="text-muted-foreground" />;
}
