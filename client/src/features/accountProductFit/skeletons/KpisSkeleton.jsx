import { Skeleton } from "@/components/ui/Skeleton";
import { KPI_SECTIONS } from "../constants/accountProductFit.constants";

export function KpisSkeleton() {
  return (
    <div className="space-y-6">
      {KPI_SECTIONS.map((section) => (
        <div key={section.id} className="border-l-2 border-border pl-3">
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-2.5 w-28" />
          </div>
          <div>
            {section.metrics.map((metric) => (
              <div
                key={metric.key}
                className="flex items-center justify-between px-2 py-1.5"
              >
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
