import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Delay before a keystroke is committed to the (server-side) filter state. */
const DEBOUNCE_MS = 400;

/** Generous ceiling on typed digits — guards against pasting an absurdly long number. */
const MAX_DIGITS = 9;

function sanitizeDigits(raw) {
  return raw
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, MAX_DIGITS);
}

export function FleetSizeRangeFilter({
  min = 0,
  max = 10000,
  value = [min, max],
  onChange,
  label,
  className,
}) {
  const [minDraft, setMinDraft] = useState(
    value[0] > min ? String(value[0]) : "",
  );
  const [maxDraft, setMaxDraft] = useState(
    value[1] < max ? String(value[1]) : "",
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // An external reset (e.g. "Clear all filters") collapses value back to the
  // full [min, max] range — mirror that by clearing the boxes too.
  useEffect(() => {
    if (value[0] <= min && value[1] >= max) {
      setMinDraft("");
      setMaxDraft("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value[0], value[1], min, max]);

  const minNum = minDraft === "" ? min : Number(minDraft);
  const maxNum = maxDraft === "" ? max : Number(maxDraft);
  const hasInvalidRange =
    minDraft !== "" && maxDraft !== "" && maxNum <= minNum;

  useEffect(() => {
    if (hasInvalidRange) return undefined;

    const timer = setTimeout(() => {
      onChangeRef.current?.([minNum, maxNum]);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDraft, maxDraft, hasInvalidRange]);

  const inputClassName = (invalid) =>
    cn(
      "w-32 min-w-0 rounded-lg border bg-white py-1.5 px-3 text-sm text-gray-800",
      "placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors",
      invalid
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200/80 focus:border-dark-blue/30 focus:ring-dark-blue/10",
    );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={MAX_DIGITS}
          value={minDraft}
          onChange={(event) => setMinDraft(sanitizeDigits(event.target.value))}
          placeholder="Min"
          aria-label={`${label ?? "Fleet size"} minimum`}
          aria-invalid={hasInvalidRange}
          className={inputClassName(hasInvalidRange)}
        />

        <span className="shrink-0 text-muted-foreground">–</span>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={MAX_DIGITS}
          value={maxDraft}
          onChange={(event) => setMaxDraft(sanitizeDigits(event.target.value))}
          placeholder="Max"
          aria-label={`${label ?? "Fleet size"} maximum`}
          aria-invalid={hasInvalidRange}
          className={inputClassName(hasInvalidRange)}
        />
      </div>

      {hasInvalidRange && (
        <span className="text-xs text-red-500">
          Max must be greater than min
        </span>
      )}
    </div>
  );
}
