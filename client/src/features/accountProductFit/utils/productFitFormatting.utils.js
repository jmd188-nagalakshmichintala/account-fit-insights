import { formatCurrencyCompact } from "@/lib/formatters";
import {
  AVATAR_GRADIENTS,
  SCORE_THRESHOLDS,
} from "../constants/accountProductFit.constants";

/**
 * Format a date value for display.
 * Accepts a Date object, ISO string, or timestamp number.
 * Returns a locale-formatted date string (e.g. "Jan 15, 2024"), or "-" for nullish/invalid values.
 */
export function formatDate(value) {
  if (value == null) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a month-level date value (e.g. "2026-06-01") for display as "Jun 2026".
 * Formatted in UTC so the day-of-month component can't roll the result into an
 * adjacent month under a negative timezone offset. Returns "-" for nullish/invalid values.
 */
export function formatMonthYear(value) {
  if (value == null) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Turn product metadata (for Owned products) into an ordered list of
 * `{ label, value }` for the metadata tooltip. Only includes fields that have values.
 */
export function mapProductMetadata(metadata) {
  if (metadata == null) return [];

  const items = [];

  if (metadata.product_start_date) {
    items.push({
      label: "Start Date",
      value: formatDate(metadata.product_start_date),
    });
  }

  if (metadata.current_arr != null) {
    items.push({
      label: "Current ARR",
      value: formatCurrencyCompact(Number(metadata.current_arr)),
    });
  }

  if (metadata.estim_transac_rev != null) {
    items.push({
      label: "Estimated Transactional Revenue",
      value: formatCurrencyCompact(Number(metadata.estim_transac_rev)),
    });
  }

  return items;
}

/**
 * Format a KPI value for display based on the metric's optional `format` hint.
 * Falls back to "-" for nullish values.
 */
export function formatKpiValue(format, value) {
  if (value == null) return "-";
  if (format === "currency") return formatCurrencyCompact(Number(value));
  if (format === "percentage") return `${Number(value)}%`;
  if (format === "date") return formatDate(value);
  if (format === "scorePercentile") {
    const percentile =
      value.percentile == null ? "-" : Number(value.percentile).toFixed(2);
    return `${value.score ?? "-"} / ${percentile}`;
  }
  return value;
}

/** Points below its threshold at which a CSA percentile counts as "near" it. */
const CSA_NEAR_THRESHOLD_MARGIN = 10;

/**
 * Severity of a CSA percentile relative to its FMCSA intervention threshold.
 * Both `percentile` and `threshold` are on a 1-100 scale (e.g. 80). Returns
 * "red" at/above threshold, "amber" within the near-margin below it, or null
 * when comfortably clear.
 */
export function getCsaAlertSeverity(percentile, threshold) {
  if (threshold == null || percentile == null) return null;

  const percentileScore = Number(percentile);
  if (percentileScore >= threshold) return "red";
  if (percentileScore >= threshold - CSA_NEAR_THRESHOLD_MARGIN) return "amber";
  return null;
}

/**
 * Sign-based text color for growth metrics (percentage format, e.g. YoY):
 * green when positive, red when negative, black at zero. Returns "" for other
 * formats / nullish values so the default text color applies.
 */
export function getKpiValueColorClass(format, value) {
  if (format !== "percentage" || value == null) return "";

  const numeric = Number(value);
  if (numeric > 0) return "text-green-700";
  if (numeric < 0) return "text-red-700";
  return "text-black";
}

/** Resolve the badge style for a numeric safety/compliance score. */
export function getSafetyScoreStyle(value) {
  const match = SCORE_THRESHOLDS.find((threshold) => value >= threshold.min);
  return match?.className ?? "";
}

/** Build up-to-two uppercase initials from a person's name. */
export function getInitials(name) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Deterministically pick an avatar gradient from a name. */
export function getAvatarGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0];

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
