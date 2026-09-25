import { cn } from "@/lib/utils";
import { getSafetyScoreStyle } from "../../utils/productFitFormatting.utils";

export function SafetyCell({ value }) {
  if (value == null) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-11 justify-center rounded-full border px-3 py-1 text-xs font-medium",
        getSafetyScoreStyle(value),
      )}
    >
      {value}
    </span>
  );
}
