import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config.js";

/**
 * Coerce an untrusted page-size query param into a safe integer.
 *
 * Guards against `LIMIT NaN` (500s) and unbounded/expensive scans: anything
 * non-numeric falls back to the default, and the result is clamped to
 * [1, MAX_PAGE_SIZE].
 *
 * @param {unknown} value
 * @returns {number}
 */
export function clampPageSize(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(1, Math.trunc(parsed)), MAX_PAGE_SIZE);
}

export function normalizePageNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.trunc(parsed);
}

/**
 * Normalise an untrusted sort-order query param to "asc" | "desc".
 * Anything other than "asc" resolves to "desc" (the table's default).
 *
 * @param {unknown} value
 * @returns {"asc" | "desc"}
 */
export function normalizeSortOrder(value) {
  return value === "asc" ? "asc" : "desc";
}

/**
 * Normalise an untrusted multi-value query param into an array of non-empty
 * strings.
 *
 * Express parses repeated params (`?x=a&x=b`) as an array and a single one as a
 * string; this collapses both (and missing) into a clean string[]. Use for
 * "IN (...)"-style filters where the client may send one or many values.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeStringList(value) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];

  return values
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
}

/**
 * Normalise an untrusted single-value query param into a trimmed string.
 *
 * Collapses a repeated param (Express parses `?x=a&x=b` as an array) to its
 * first entry and returns "" for missing/blank input. Use for free-text
 * "contains"-style search filters.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeString(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw == null ? "" : String(raw).trim();
}

/**
 * Normalise an untrusted boolean query param into true | false | null.
 *
 * Accepts "true" or "false" (case-insensitive) and returns the corresponding
 * boolean. Any other value (missing, empty, garbage) returns null, signaling
 * "no preference / don't filter".
 *
 * @param {unknown} value
 * @returns {boolean | null}
 */
export function normalizeBoolean(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null) return null;

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

/**
 * Normalise an untrusted number query param into a finite number or null.
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function normalizeNumber(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === "") return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Normalise an untrusted trend-direction query param into "up" | "down" | null.
 *
 * @param {unknown} value
 * @returns {"up" | "down" | null}
 */
export function normalizeTrendDirection(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null) return null;

  const normalized = String(raw).trim().toLowerCase();
  return normalized === "up" || normalized === "down" ? normalized : null;
}

export function normalizeScoreRange(min, max) {
  const minVal = normalizeNumber(min);
  const maxVal = normalizeNumber(max);

  if (minVal == null || maxVal == null) {
    return { min: null, max: null };
  }

  if (minVal > maxVal) {
    return { min: maxVal, max: minVal };
  }

  return { min: minVal, max: maxVal };
}

/**
 * Round a number up to a nice round value for slider max.
 * Examples: 1467 → 1500, 4832 → 5000, 245 → 250, 67 → 70
 *
 * @param {number} value
 * @returns {number}
 */
export function roundToNiceNumber(value) {
  if (value <= 0) return 0;
  if (value <= 10) return 10;

  // Find the order of magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));

  // Round up to the next multiple based on magnitude
  // For values like 1467, magnitude is 1000, we round to nearest 50 or 100
  const step = magnitude >= 1000 ? magnitude / 20 : magnitude / 10;

  return Math.ceil(value / step) * step;
}
