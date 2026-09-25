import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Centered loading spinner with an optional label. */
export function Spinner({ label, className, iconClassName }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-8",
        className,
      )}
    >
      <Loader2
        className={cn(
          "h-5 w-5 animate-spin text-muted-foreground",
          iconClassName,
        )}
      />
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  );
}
