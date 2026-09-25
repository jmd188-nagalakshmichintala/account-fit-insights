import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  children,
  title,
  className,
  maxWidth = 600,
}) {
  const contentRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Focus management: save previous focus, focus modal, restore on close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;

      const firstFocusable = contentRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        contentRef.current?.focus();
      }
    } else {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (event) => {
    // Only close if clicking directly on the backdrop, not bubbled from content
    if (event.target === event.currentTarget) {
      event.stopPropagation();
      onClose();
    }
  };

  const handleCloseClick = (event) => {
    event.stopPropagation();
    onClose();
  };

  const handleModalContentClick = (event) => {
    event.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={contentRef}
        onClick={handleModalContentClick}
        className={cn(
          "relative w-full bg-white border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-scale-in overflow-hidden flex flex-col",
          className,
        )}
        style={{ maxWidth: `${maxWidth}px`, maxHeight: "90vh" }}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
          <div className="text-lg font-semibold text-slate-900 flex items-center">
            {title || "Modal"}
          </div>
          <button
            type="button"
            onClick={handleCloseClick}
            className="cursor-pointer rounded-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - scrollable if needed */}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
