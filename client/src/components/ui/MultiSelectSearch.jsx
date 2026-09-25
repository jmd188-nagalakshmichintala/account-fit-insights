import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelectSearch({
  query,
  onQueryChange,
  searchInputRef,
  searchPlaceholder,
}) {
  return (
    <div className="border-b border-gray-100 p-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search options"
          className={cn(
            "w-full rounded-lg border border-gray-200/80 bg-white py-1.5 pl-8 pr-8 text-sm text-gray-800",
            "placeholder:text-gray-400",
            "focus:border-dark-blue/30 focus:outline-none focus:ring-2 focus:ring-dark-blue/10",
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onQueryChange("");
              searchInputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-blue/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
