import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

function TimelineRowSkeleton({ isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
        {!isLast && <span className="w-px flex-1 bg-border" />}
      </div>
      <div
        className={cn("min-w-0 flex-1 space-y-1.5", isLast ? "pb-0" : "pb-5")}
      >
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function EngagementGroupSkeleton({ titleWidth, rows = 2 }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className={cn("h-2.5", titleWidth)} />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, index) => (
          <TimelineRowSkeleton key={index} isLast={index === rows - 1} />
        ))}
      </div>
    </div>
  );
}

export function EngagementSkeleton() {
  return (
    <div className="space-y-6">
      <EngagementGroupSkeleton titleWidth="w-40" />
      <EngagementGroupSkeleton titleWidth="w-28" />
    </div>
  );
}
