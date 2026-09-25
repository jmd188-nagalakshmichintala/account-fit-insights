import { cn } from "@/lib/utils";

/**
 * Radio button group component for selecting a single option from a list.
 * Renders radio buttons horizontally (side by side) by default.
 */
export function Radio({
  options = [],
  value,
  onChange,
  name,
  className,
  orientation = "horizontal",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "flex gap-4",
        orientation === "vertical" && "flex-col gap-2",
        className,
      )}
    >
      {options.map((option) => {
        const inputId = `${name}-${option.value}`;
        return (
          <label
            key={option.value}
            htmlFor={inputId}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="radio"
              id={inputId}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "h-4 w-4 cursor-pointer border-gray-300",
                "focus:ring-2 focus:ring-dark-blue/20 focus:ring-offset-0",
              )}
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
