/**
 * Helpers for the table's column-filter state — a generic array of
 * `{ id, value }` entries (mirroring TanStack's `columnFilters` shape, and the
 * `[{ id, desc }]` sorting shape), where `value` is the array of selected
 * option ids for that column.
 */

/** Read the selected values for a column (empty array when none). */
export function getColumnFilterValue(columnFilters = [], columnId) {
  return columnFilters.find((filter) => filter.id === columnId)?.value ?? [];
}

/**
 * Return a new column-filter array with `columnId` set to `value`. An empty
 * selection removes the entry entirely, keeping the state minimal.
 * Supports both array values (multi-select) and single values (boolean, string).
 */
export function setColumnFilterValue(columnFilters = [], columnId, value) {
  const others = columnFilters.filter((filter) => filter.id !== columnId);

  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return others;
  }

  return [...others, { id: columnId, value }];
}
