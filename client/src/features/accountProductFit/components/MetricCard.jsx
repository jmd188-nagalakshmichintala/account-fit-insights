import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { METRIC_CARD_STYLES } from "../constants/accountProductFit.constants";

export function MetricCard({
  label,
  value,
  variant = "default",
  icon: Icon,
  isLoading = false,
  isError = false,
}) {
  const styles = METRIC_CARD_STYLES[variant] ?? METRIC_CARD_STYLES.default;

  return (
    <Card
      className={cn(
        "group min-w-0 cursor-pointer p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "min-w-0 text-xs font-medium uppercase tracking-wide",
            styles.label,
          )}
        >
          {label}
        </div>
        {Icon && (
          <Icon className="h-6 w-6 shrink-0 opacity-40 transition-all duration-200 group-hover:opacity-70" />
        )}
      </div>
      <div className="truncate text-3xl font-semibold leading-none">
        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
        ) : isError ? (
          <span className="text-red-500">Error</span>
        ) : value !== null && value !== undefined ? (
          value
        ) : (
          "—"
        )}
      </div>
    </Card>
  );
}
