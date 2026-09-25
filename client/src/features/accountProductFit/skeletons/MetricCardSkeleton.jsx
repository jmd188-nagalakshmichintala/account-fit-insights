import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function MetricCardSkeleton() {
  return Array.from({ length: 3 }).map((_, index) => (
    <Card key={index} className="p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-6" />
      </div>
      <Skeleton className="mt-2 h-8 w-16" />
    </Card>
  ));
}
