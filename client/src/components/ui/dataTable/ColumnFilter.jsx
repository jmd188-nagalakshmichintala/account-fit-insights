import { useState } from "react";
import { Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/MultiSelect";

/**
 * Column-header filter: a funnel icon that opens a {@link MultiSelect} of the
 * column's options. Rendered by {@link HeaderCell} only when a column opts in
 * with `columnFilters: true` and provides `filterMeta.options` — it never
 * appears on its own.
 *
 * Selection is uncontrolled by default so the UI works standalone today. When
 * filtering is wired to the backend, pass `selectedIds` + `onChange` to lift
 * the selected `option.id`s up (the future API will consume that array).
 */
export function ColumnFilter({ options = [], selectedIds, onChange }) {
  const isControlled = selectedIds !== undefined;
  const [internalSelected, setInternalSelected] = useState([]);
  const selected = isControlled ? selectedIds : internalSelected;

  const handleChange = (next) => {
    if (!isControlled) setInternalSelected(next);
    onChange?.(next);
  };

  const hasActiveFilters = selected.length > 0;

  return (
    <MultiSelect
      options={options}
      selectedIds={selected}
      onChange={handleChange}
      align="start"
      renderTrigger={({ toggle }) => (
        <button
          type="button"
          // Stop the click bubbling to the header's sort toggle.
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          aria-label="Filter column"
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded p-0.5 transition-colors",
            hasActiveFilters
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Filter size={14} fill={hasActiveFilters ? "currentColor" : "none"} />
        </button>
      )}
    />
  );
}
