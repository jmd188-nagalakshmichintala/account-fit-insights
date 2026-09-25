import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelectOptions({
  options,
  filteredOptions,
  selectedIds,
  onToggleOption,
  emptyMessage,
}) {
  return (
    <div
      role="listbox"
      aria-multiselectable="true"
      className="max-h-48 overflow-auto p-1.5"
    >
      {options.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-400">{emptyMessage}</p>
      ) : filteredOptions.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-400">No results found</p>
      ) : (
        filteredOptions.map((option) => {
          const isSelected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onToggleOption(option.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "focus:bg-gray-50 focus:text-gray-900 focus:outline-none",
                isSelected && "font-semibold text-dark-blue",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isSelected
                    ? "border-dark-blue bg-dark-blue text-white"
                    : "border-gray-300",
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </span>
              <span className="truncate">{option.label}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
