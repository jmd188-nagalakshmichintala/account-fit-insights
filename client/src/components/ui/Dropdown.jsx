import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Eraser } from "lucide-react";

import { cn } from "@/lib/utils";

export function Dropdown({
  label,
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  disabled = false,
  allowClear = true,
  className,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((option) => option.id === value);

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

  const handleSelect = (optionId) => {
    onChange(optionId);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between",
          "rounded-xl border border-gray-200/80 bg-white px-4 text-sm font-medium",
          "shadow-sm transition-all duration-200",
          "hover:border-gray-300 hover:bg-gray-50/50",
          "focus:border-dark-blue/30 focus:outline-none focus:ring-2 focus:ring-dark-blue/10",
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-dark-blue/30 ring-2 ring-dark-blue/10",
        )}
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
          {selectedOption?.label ?? placeholder}
        </span>

        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="max-h-48 overflow-auto p-1.5">
            {options.map((option) => {
              const isSelected = option.id === value;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    "cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isSelected &&
                      "bg-dark-blue/5 font-semibold text-dark-blue hover:bg-dark-blue/5",
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-dark-blue" />
                  )}
                </button>
              );
            })}
          </div>

          {allowClear && value && (
            <div className="border-t border-gray-100 p-1.5">
              <button
                type="button"
                onClick={handleClear}
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
