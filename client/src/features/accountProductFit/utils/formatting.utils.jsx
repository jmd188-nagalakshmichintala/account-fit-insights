import { DEPRIORITIZE_REASON_LABELS } from "../constants/dePrioritizedAccounts.constants";
import { DeprioritizedAccountNameCell } from "../components/cells/DeprioritizedAccountNameCell";

/**
 * Format a timestamp into a human-readable date-time string.
 * Returns "—" for nullish values.
 *
 * @param {string | number | Date} timestamp - The timestamp to format
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024, 3:45 PM") or "—"
 */
export function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a deprioritization reason code into its display label.
 * Falls back to the raw code if no label is found.
 *
 * @param {string} reason - The reason code (e.g., "NO_BUDGET")
 * @returns {string} The formatted label (e.g., "No Budget")
 */
export function formatReason(reason) {
  return DEPRIORITIZE_REASON_LABELS[reason] || reason;
}

/**
 * Render a cell value based on the column key and row data.
 * Handles special formatting for different column types.
 *
 * @param {string} columnKey - The column identifier
 * @param {Object} row - The row data object
 * @returns {React.ReactNode} The rendered cell content
 */
export function renderCellValue(columnKey, row, isChildRow = false) {
  // Special handling for account name - uses custom cell component
  if (columnKey === "sf_account_name") {
    return <DeprioritizedAccountNameCell row={row} isChildRow={isChildRow} />;
  }

  // Get the raw value from the row
  const value = row[columnKey];

  // Special formatting for specific columns
  if (columnKey === "reason") {
    return formatReason(value);
  }

  if (columnKey === "deprioritized_at") {
    return <span className="text-xs">{formatDate(value)}</span>;
  }

  // Default: show value or fallback to "—"
  return value ?? "—";
}
