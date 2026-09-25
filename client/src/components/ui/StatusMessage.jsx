import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { STATUS_MESSAGE_STYLES } from "@/constants/ui.constants";

export function StatusMessage({
  variant = "info",
  title,
  message,
  icon,
  className,
}) {
  const showIcon =
    icon ??
    (variant === "error" ? <AlertCircle className="h-4 w-4 shrink-0" /> : null);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-4 py-3 text-sm",
        STATUS_MESSAGE_STYLES[variant],
        className,
      )}
    >
      {showIcon}
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {message && (
          <p className={cn(title && "mt-0.5 text-xs opacity-90")}>{message}</p>
        )}
      </div>
    </div>
  );
}
