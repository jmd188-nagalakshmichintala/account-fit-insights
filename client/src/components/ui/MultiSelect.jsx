import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Eraser } from "lucide-react";

import { cn } from "@/lib/utils";
import { MultiSelectSearch } from "./MultiSelectSearch";
import { MultiSelectOptions } from "./MultiSelectOptions";

/**
 * Generic, controlled multi-select dropdown with built-in search.
 *
 * Options follow the shared `{ id, label }` shape used across the app. Selection
 * is fully controlled: pass `selectedIds` (an array of `option.id`) and handle
 * `onChange(nextIds)`.
 *
 * A search box at the top of the popup filters options by label
 * (case-insensitive) in real time; it's available to every consumer with no
 * extra wiring. Pass `renderTrigger` to supply a custom trigger (the column
 * filter uses an icon); otherwise a default select-style button is rendered.
 */
export function MultiSelect({
  options = [],
  selectedIds = [],
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No options",
  align = "end",
  renderTrigger,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside the dropdown.
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

  // On open: reset the search (restores the full list) and focus the input.
  useEffect(() => {
    if (!open) return;

    setQuery("");
    searchInputRef.current?.focus();
  }, [open]);

  const toggle = () => setOpen((prev) => !prev);

  const toggleOption = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];

    onChange?.(next);
  };

  // Filter by label, case-insensitive. Memoised so typing stays smooth even
  // with a large option list. Selection state is untouched by searching.
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      String(option.label).toLowerCase().includes(normalizedQuery),
    );
  }, [options, normalizedQuery]);

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      {renderTrigger ? (
        renderTrigger({ open, toggle, selectedCount: selectedIds.length })
      ) : (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex h-10 w-full cursor-pointer items-center justify-between gap-2",
            "rounded-xl border border-gray-200/80 bg-white px-4 text-sm font-medium",
            "shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50/50",
            open && "border-dark-blue/30 ring-2 ring-dark-blue/10",
          )}
        >
          <span
            className={selectedIds.length ? "text-gray-800" : "text-gray-400"}
          >
            {selectedIds.length
              ? `${selectedIds.length} selected`
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      )}

      {open && (
        <div
          // Keep clicks inside the popup from bubbling to ancestors (e.g. a
          // sortable column header's sort toggle).
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "absolute top-full z-50 mt-1.5 w-60 overflow-hidden",
            "rounded-xl border border-gray-100 bg-white shadow-xl",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.length > 0 && (
            <MultiSelectSearch
              query={query}
              onQueryChange={setQuery}
              searchInputRef={searchInputRef}
              searchPlaceholder={searchPlaceholder}
            />
          )}

          <MultiSelectOptions
            options={options}
            filteredOptions={filteredOptions}
            selectedIds={selectedIds}
            onToggleOption={toggleOption}
            emptyMessage={emptyMessage}
          />

          {selectedIds.length > 0 && (
            <div className="border-t border-gray-100 p-1.5">
              <button
                type="button"
                onClick={() => {
                  onChange?.([]);
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-gray-500 hover:bg-gray-50 hover:text-dark-blue",
                  "focus:bg-gray-50 focus:text-dark-blue focus:outline-none",
                )}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
