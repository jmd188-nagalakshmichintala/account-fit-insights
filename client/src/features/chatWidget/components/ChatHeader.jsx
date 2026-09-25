import { History, SquarePen, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatHeader({
  title = "Genie",
  onNewChat,
  onToggleHistory,
  onClose,
  className,
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 px-4 py-3 shrink-0",
        className,
      )}
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat"
          className="cursor-pointer rounded-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 transition-colors"
        >
          <SquarePen className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleHistory}
          aria-label="Chat history"
          className="cursor-pointer rounded-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 transition-colors"
        >
          <History className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
