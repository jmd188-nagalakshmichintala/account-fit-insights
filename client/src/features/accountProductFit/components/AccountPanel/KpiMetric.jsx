import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { CsaAlertIndicator } from "./CsaAlertIndicator";
import { KpiMetricTooltip } from "./KpiMetricTooltip";
import { ISS_SCORE_STYLES } from "../../constants/accountProductFit.constants";

function TrendIndicator({ format, rawValue }) {
  if (format !== "percentage" || rawValue == null) return null;
  const n = Number(rawValue);
  if (n > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
  if (n < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
  return null;
}

/**
 * One KPI row: label on the left, trend indicator + value on the right.
 * `rawValue` drives the trend arrow; `value` is the pre-formatted display string.
 * `valueClassName` carries any sign-based color.
 */
export function KpiMetric({
  metricKey,
  label,
  value,
  rawValue,
  additionalData,
  format,
  valueClassName,
  threshold,
}) {
  const isIssBadge =
    metricKey === "issScore" && value && ISS_SCORE_STYLES[value];

  return (
    <div className="group -mx-1 flex items-center justify-between gap-4 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex shrink-0 items-center gap-1.5">
        {isIssBadge ? (
          // Special rendering for ISS Score - show as colored badge
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              ISS_SCORE_STYLES[value],
            )}
          >
            {value}
          </span>
        ) : (
          <>
            <CsaAlertIndicator
              percentile={rawValue?.percentile}
              threshold={threshold}
            />
            <TrendIndicator format={format} rawValue={rawValue} />
            <KpiMetricTooltip additionalData={additionalData} format={format}>
              <span
                className={cn(
                  "text-xs font-semibold text-foreground transition-colors group-hover:text-blue-700",
                  valueClassName,
                )}
              >
                {value ?? "-"}
              </span>
            </KpiMetricTooltip>
            {threshold != null && (
              <Tooltip
                side="top"
                width={210}
                content={
                  <p className="p-2.5 text-xs text-slate-600">
                    Threshold range: {threshold} percentile
                  </p>
                }
              >
                <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-blue-500" />
              </Tooltip>
            )}
          </>
        )}
      </dd>
    </div>
  );
}
