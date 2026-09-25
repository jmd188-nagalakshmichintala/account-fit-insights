import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useTooltipPosition } from "./useTooltipPosition";

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  width = 280,
  className,
  contentClassName,
}) {
  const { open, coords, triggerRef, panelRef, tooltipId, show, scheduleHide } =
    useTooltipPosition({ side, align, width });

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
      onBlur={scheduleHide}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={tooltipId}
            role="tooltip"
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width,
            }}
            className={cn(
              "z-50 rounded-none border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
              contentClassName,
            )}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}
