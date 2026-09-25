import { Skeleton } from "@/components/ui/Skeleton";

export function ContactsSkeleton({ count = 4 }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pl-12">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
