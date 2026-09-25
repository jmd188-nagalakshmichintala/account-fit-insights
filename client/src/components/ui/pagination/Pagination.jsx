import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  disabled = false,
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRow = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalCount);

  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);
    onPageSizeChange(newPageSize);
  };

  return (
    <div className="flex items-center justify-end gap-6 rounded-b-lg border border-t-0 border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          disabled={disabled}
          className={cn(
            "h-8 rounded-md border border-input bg-background px-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {pageSizeOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-muted-foreground">
        {startRow}–{endRow} of {totalCount}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-input",
            "transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            !canGoPrevious && "cursor-not-allowed opacity-50",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-input",
            "transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            !canGoNext && "cursor-not-allowed opacity-50",
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
