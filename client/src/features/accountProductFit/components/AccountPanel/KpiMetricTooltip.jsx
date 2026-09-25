import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { humanizeMetricKey } from "../../utils/accountProductFit.utils";
import {
  formatKpiValue,
  getKpiValueColorClass,
} from "../../utils/productFitFormatting.utils";

/**
 * Wraps a KPI value with a tooltip that breaks down its `additionalData`.
 * Shows a small Info icon next to the value when additional data is present.
 * Renders `children` untouched when there is no additional data.
 */
export function KpiMetricTooltip({ additionalData, format, children }) {
  const entries = Object.entries(additionalData ?? {}).filter(
    ([, value]) => value != null,
  );

  if (entries.length === 0) return children;

  return (
    <Tooltip
      side="top"
      width={240}
      className="group cursor-pointer"
      content={
        <dl className="space-y-1.5 p-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-6 text-xs"
            >
              <dt className="text-slate-500">{humanizeMetricKey(key)}</dt>
              <dd
                className={cn(
                  "font-medium",
                  getKpiValueColorClass(format, value) || "text-slate-900",
                )}
              >
                {formatKpiValue(format, value)}
              </dd>
            </div>
          ))}
        </dl>
      }
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <Info className="h-3 w-3 text-muted-foreground/40 transition-colors group-hover:text-blue-500" />
      </span>
    </Tooltip>
  );
}
