/** Shared, app-wide UI constants used by generic primitives in components/ui. */
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export const TOAST_STYLES = {
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
};

export const ICON_STYLES = {
  success: "text-green-600",
  error: "text-red-600",
  info: "text-blue-600",
};

export const STATUS_MESSAGE_STYLES = {
  error: "border border-destructive/40 bg-destructive/10 text-destructive",
  empty: "bg-muted/50 text-muted-foreground",
  info: "bg-amber-50/60 text-amber-600",
};
