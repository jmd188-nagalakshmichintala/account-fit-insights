import { MetricCardSkeleton } from "../skeletons/MetricCardSkeleton";
import { MetricCard } from "./MetricCard";

export function ProductFitSummary({ metrics, isLoading }) {
  return (
    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {isLoading ? (
        <MetricCardSkeleton />
      ) : (
        metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            variant={metric.variant}
            icon={metric.icon}
          />
        ))
      )}
    </div>
  );
}
