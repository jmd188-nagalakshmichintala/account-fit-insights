import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ isOpen, onClose, title, children, className }) {
  return (
    <aside
      className={cn(
        "fixed bottom-0 right-0 top-14 z-30 flex w-[520px] transform flex-col",
        "border-l border-gray-200/60 bg-white shadow-2xl",
        "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isOpen ? "translate-x-0" : "translate-x-full",
        className,
      )}
    >
      {/* Header */}
      <div className="relative border-b border-slate-200 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              View and manage account information
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="-mr-1 -mt-1 cursor-pointer rounded-sm p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
        {children}
      </div>
    </aside>
  );
}
