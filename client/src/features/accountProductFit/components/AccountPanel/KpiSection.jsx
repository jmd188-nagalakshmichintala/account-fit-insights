import { cn } from "@/lib/utils";
import {
  formatKpiValue,
  getKpiValueColorClass,
} from "../../utils/productFitFormatting.utils";
import { KpiMetric } from "./KpiMetric";

/**
 * A flat KPI section: a colored left-border accent with icon + uppercase title,
 * followed by metric rows. No Card wrapper — all sections flow as one list.
 */
export function KpiSection({
  title,
  metrics,
  data,
  icon: Icon,
  iconBg,
  iconColor,
  accentBorder,
}) {
  return (
    <div className={cn("border-l-2 pl-3", accentBorder)}>
      <div className="mb-2 flex items-center gap-2">
        <div
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded",
            iconBg,
          )}
        >
          <Icon className={cn("h-3 w-3", iconColor)} />
        </div>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
      </div>

      <dl>
        {metrics.map((metric) => {
          const entry = data?.[metric.key];

          return (
            <KpiMetric
              key={metric.key}
              metricKey={metric.key}
              label={metric.label}
              value={formatKpiValue(metric.format, entry?.mainData)}
              rawValue={entry?.mainData}
              valueClassName={getKpiValueColorClass(
                metric.format,
                entry?.mainData,
              )}
              additionalData={entry?.additionalData}
              format={metric.format}
              threshold={metric.threshold}
            />
          );
        })}
      </dl>
    </div>
  );
}
