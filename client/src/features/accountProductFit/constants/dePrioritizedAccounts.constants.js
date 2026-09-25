export const DEPRIORITIZED_COLUMNS = [
  { key: "sf_account_name", label: "Account Name" },
  { key: "account_tier", label: "Account Tier" },
  { key: "reason", label: "Reason" },
  { key: "deprioritized_at", label: "Deprioritized At" },
  { key: "deprioritized_by", label: "Deprioritized By" },
];

/**
 * Single source of truth for deprioritization reasons.
 * Used for both the Radio component options and label lookups.
 */
export const DEPRIORITIZE_REASONS = [
  { value: "NO_BUDGET", label: "No Budget" },
  { value: "COMPETITOR_IN_PLACE", label: "Competitor in place" },
  { value: "BAD_DATA", label: "Bad Data" },
  { value: "NO_AUTHORITY_CONTACT", label: "No Authority / Contact" },
  { value: "NOT_FIT", label: "Not a fit" },
  { value: "OTHER", label: "Other" },
];

/**
 * Lookup map derived from DEPRIORITIZE_REASONS for quick label access.
 * Used for displaying formatted reason labels in tables.
 */
export const DEPRIORITIZE_REASON_LABELS = DEPRIORITIZE_REASONS.reduce(
  (acc, { value, label }) => {
    acc[value] = label;
    return acc;
  },
  {},
);
