import { useEffect, useRef, useState } from "react";
import { Filter, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Delay before a keystroke is committed to the (server-side) filter state. */
const SEARCH_DEBOUNCE_MS = 300;

export function ColumnSearchFilter({
  value,
  onChange,
  placeholder = "Search…",
}) {
  const committed = typeof value === "string" ? value : "";

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(committed);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const hasActiveFilter = committed.length > 0;

  useEffect(() => {
    setDraft((prev) => (prev.trim() === committed ? prev : committed));
  }, [committed]);

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === committed) return undefined;

    const timer = setTimeout(
      () => onChangeRef.current?.(trimmed),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [draft, committed]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const clear = () => {
    setDraft("");
    onChangeRef.current?.("");
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Search column"
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded p-0.5 transition-colors",
          hasActiveFilter
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Filter size={14} fill={hasActiveFilter ? "currentColor" : "none"} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className={cn(
                "w-full rounded-lg border border-gray-200/80 bg-white py-1.5 pl-8 pr-8 text-sm text-gray-800",
                "placeholder:text-gray-400",
                "focus:border-dark-blue/30 focus:outline-none focus:ring-2 focus:ring-dark-blue/10",
              )}
            />
            {draft && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clear}
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-blue/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
