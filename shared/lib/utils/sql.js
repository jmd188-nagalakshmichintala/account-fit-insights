/**
 * Convert a JS value into a safe SQL literal.
 *
 * Databricks SQL doesn't support bound parameters through this driver path, so
 * every value interpolated into a query MUST go through here to avoid SQL
 * injection. Strings have single quotes doubled; numbers are emitted bare;
 * null/undefined become NULL.
 */
export function toSqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}
