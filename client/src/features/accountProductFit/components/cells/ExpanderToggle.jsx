import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Leftmost-column expand/collapse toggle for a topAccount's child accounts.
 * Renders nothing when the group has no children (`hasChildren` false) — a
 * child row never gets one, since the grouped payload is a fixed two-level
 * hierarchy (topAccount + a flat childAccounts list, no grandchildren).
 */
export function ExpanderToggle({ hasChildren, isExpanded, onToggle, rowId }) {
  if (!hasChildren) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(rowId);
      }}
      className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={
        isExpanded ? "Collapse child accounts" : "Expand child accounts"
      }
      aria-expanded={isExpanded}
    >
      {isExpanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}
