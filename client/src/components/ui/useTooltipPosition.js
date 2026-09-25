import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const OFFSET = 8;
const VIEWPORT_PADDING = 8;
// Grace period before hiding, so the cursor can cross the gap between the
// trigger and the (portaled) panel without the tooltip closing.
const HIDE_DELAY = 120;

/** Owns open/hover/position state for a portaled tooltip anchored to a trigger element. */
export function useTooltipPosition({ side, align, width }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const hideTimer = useRef(null);
  const tooltipId = useId();

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // Keep the tooltip open while the cursor is over the trigger OR the panel.
  const show = useCallback(() => {
    cancelHide();
    setOpen(true);
  }, [cancelHide]);

  // Defer hiding so moving onto the panel (or back to the trigger) cancels it.
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setOpen(false), HIDE_DELAY);
  }, [cancelHide]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panelWidth = panelRef.current?.offsetWidth ?? width;
    const panelHeight = panelRef.current?.offsetHeight ?? 0;

    let top;
    let left;

    // Positioning based on `side`
    if (side === "right" || side === "left") {
      // Horizontal placement (right or left)
      top = rect.top + rect.height / 2 - panelHeight / 2;
      left =
        side === "right"
          ? rect.right + OFFSET
          : rect.left - panelWidth - OFFSET;
    } else {
      // Vertical placement (top or bottom)
      top =
        side === "bottom"
          ? rect.bottom + OFFSET
          : rect.top - panelHeight - OFFSET;

      // Horizontal alignment for vertical placement
      if (align === "start") {
        left = rect.left;
      } else if (align === "end") {
        left = rect.right - panelWidth;
      } else {
        left = rect.left + rect.width / 2 - panelWidth / 2;
      }
    }

    // Clamp to the viewport so the panel never spills off-screen.
    const maxLeft = window.innerWidth - panelWidth - VIEWPORT_PADDING;
    left = Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft));

    const maxTop = window.innerHeight - panelHeight - VIEWPORT_PADDING;
    top = Math.max(VIEWPORT_PADDING, Math.min(top, maxTop));

    setCoords({ top, left });
  }, [side, align, width]);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const handle = () => updatePosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);

    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open, updatePosition]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        cancelHide();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, cancelHide]);

  // Clear any pending hide timer on unmount.
  useEffect(() => cancelHide, [cancelHide]);

  return {
    open,
    coords,
    triggerRef,
    panelRef,
    tooltipId,
    show,
    scheduleHide,
  };
}
