import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  TOAST_ICONS,
  TOAST_STYLES,
  ICON_STYLES,
} from "@/constants/ui.constants";
import { cn } from "@/lib/utils";

export function Toast({ message, type = "info", onClose, duration = 5000 }) {
  const Icon = TOAST_ICONS[type];

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] animate-fade-in">
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg max-w-md",
          TOAST_STYLES[type],
        )}
      >
        {Icon && (
          <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", ICON_STYLES[type])} />
        )}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
