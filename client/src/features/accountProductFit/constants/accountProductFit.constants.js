import {
  Briefcase,
  Building2,
  DollarSign,
  Gauge,
  Package,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";

/** Color legend rendered above the product-fit table. */
export const PRODUCT_FIT_LEGEND = [
  { label: "High (8-10)", className: "bg-emerald-600" },
  { label: "Mid (4-7)", className: "bg-amber-600" },
  { label: "Low (1-3)", className: "bg-red-600" },
  { label: "Owned", className: "bg-blue-600" },
];

/** Maps account_tier value → badge styles (border + bg + text). */
export const ACCOUNT_TIER_STYLES = {
  Gold: "border-amber-400 bg-amber-50 text-amber-700",
  Silver: "border-slate-400 bg-slate-50 text-slate-600",
  Bronze: "border-orange-400 bg-orange-50 text-orange-700",
};

/** Maps account_tier value → dot color for the badge indicator. */
export const ACCOUNT_TIER_DOT = {
  Gold: "bg-amber-400",
  Silver: "bg-slate-400",
  Bronze: "bg-orange-400",
};

/** Maps account_fit value → badge styles. */
export const ACCOUNT_FIT_STYLES = {
  High: "border-emerald-300 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-300 bg-amber-50 text-amber-700",
  Low: "border-red-300 bg-red-50 text-red-700",
};

/** Maps ISS score bandwidth → badge styles (Low=green, Average=yellow, High=red). */
export const ISS_SCORE_STYLES = {
  Low: "border-emerald-300 bg-emerald-50 text-emerald-700",
  Average: "border-amber-300 bg-amber-50 text-amber-700",
  High: "border-red-300 bg-red-50 text-red-700",
};

/** Maps a CSA percentile alert severity → icon color + tooltip description. */
export const CSA_ALERT_STYLES = {
  amber: {
    icon: "text-amber-500",
    message: "The account is almost near the threshold range.",
  },
  red: {
    icon: "text-red-600",
    message: "You have crossed the threshold range.",
  },
};

/** Numeric score → badge styles, evaluated top-down (first match wins). */
export const SCORE_THRESHOLDS = [
  { min: 8, className: ACCOUNT_FIT_STYLES.High },
  { min: 4, className: ACCOUNT_FIT_STYLES.Medium },
  { min: 0, className: ACCOUNT_FIT_STYLES.Low },
];

/** Visual variants for the summary metric cards. */
export const METRIC_CARD_STYLES = {
  default: {
    card: "text-foreground",
    label: "text-muted-foreground",
  },
  success: {
    card: "text-teal-700",
    label: "text-muted-foreground",
  },
  info: {
    card: "text-blue-700",
    label: "text-muted-foreground",
  },
  dark: {
    card: "border-jet-black bg-jet-black text-white",
    label: "text-white/75",
  },
  brown: {
    card: "text-[#92400E]",
    label: "text-muted-foreground",
  },
};

/** Possible product-fit cell values that need special rendering. */
export const PRODUCT_FIT_VALUES = {
  High: "High",
  Owned: "Owned",
};

/** ComplianceCell: columnKey → the row field holding that column's Owned-product metadata. */
export const COMPLIANCE_METADATA_KEY_MAP = {
  complianceAsset: "complianceAssetMetadata",
  complianceDriver: "complianceDriverMetadata",
  safety: "safetyMetadata",
};

/** ComplianceCell: columnKey → the row field holding that column's score delta. */
export const COMPLIANCE_DELTA_SCORE_KEY_MAP = {
  complianceAsset: "complianceAssetDeltaScore",
  complianceDriver: "complianceDriverDeltaScore",
  safety: "safetyDeltaScore",
};

/** ComplianceCell: columnKey → the row field holding that column's latest month. */
export const COMPLIANCE_LATEST_MONTH_KEY_MAP = {
  complianceAsset: "complianceAssetLatestMonth",
  complianceDriver: "complianceDriverLatestMonth",
  safety: "safetyLatestMonth",
};

/** ComplianceCell: columnKey → the row field holding that column's second-latest month. */
export const COMPLIANCE_SECOND_LATEST_MONTH_KEY_MAP = {
  complianceAsset: "complianceAssetSecondLatestMonth",
  complianceDriver: "complianceDriverSecondLatestMonth",
  safety: "safetySecondLatestMonth",
};

/** ComplianceCell: columnKey → the row field holding "new fired" rules for a score increase. */
export const COMPLIANCE_NEW_FIRED_RULES_KEY_MAP = {
  complianceAsset: "complianceAssetNewFiredRules",
  complianceDriver: "complianceDriverNewFiredRules",
  safety: "safetyNewFiredRules",
};

/** ComplianceCell: columnKey → the row field holding "new not fired" rules for a score decrease. */
export const COMPLIANCE_NEW_NOT_FIRED_RULES_KEY_MAP = {
  complianceAsset: "complianceAssetNewNotFiredRules",
  complianceDriver: "complianceDriverNewNotFiredRules",
  safety: "safetyNewNotFiredRules",
};

/** ComplianceCell: columnKey → the row fields holding fired/not-fired rule lists. */
export const COMPLIANCE_RULES_KEY_MAP = {
  complianceAsset: {
    fired: "complianceAssetRulesFired",
    notFired: "complianceAssetRulesNotFired",
  },
  complianceDriver: {
    fired: "complianceDriverRulesFired",
    notFired: "complianceDriverRulesNotFired",
  },
  safety: {
    fired: "safetyRulesFired",
    notFired: "safetyRulesNotFired",
  },
};

/** Minimum score for the "Key Signals" (positive) section in RulesAnalysisModal. */
export const MIN_SCORE_FOR_KEY_SIGNALS = 2;

/** Score range for the "Why Not a Fit" (negative) section in RulesAnalysisModal. */
export const NOT_A_FIT_SCORE_RANGE = { min: 1, max: 5 };

/** Definitions for the summary metric cards, in display order. */
export const METRIC_CARDS = [
  { key: "total_accounts", label: "Total accounts", icon: Building2 },
  {
    key: "high_fit_scores",
    label: "Total high-scoring accounts",
    icon: TrendingUp,
    variant: "success",
  },
  {
    key: "open_opportunities_count",
    label: "Total accounts with open opportunities",
    icon: Package,
    variant: "info",
  },
];

/** Views available in the account-details side panel. */
export const SIDEBAR_VIEWS = [
  { id: "summary", label: "Account summary" },
  { id: "contact", label: "Customer contact details" },
  { id: "kpi", label: "Key performance indicators" },
  { id: "engagement", label: "Engagement" },
];

export const SIDEBAR_VIEW_IDS = {
  summary: "summary",
  contact: "contact",
  kpi: "kpi",
  engagement: "engagement",
};

// Potential ARR tooltip rows; `key` is the potential_arr_<key> column suffix.
export const POTENTIAL_ARR_PRODUCTS = [
  { key: "compliance_asset", label: "Compliance Asset" },
  { key: "compliance_driver", label: "Compliance Driver" },
  { key: "safety", label: "SAFETY +" },
];

/** Per-column configuration for the compliance/safety table cells. */
export const COMPLIANCE_TOOLTIP_CONFIG = {
  complianceAsset: {
    title: "Compliance Asset",
  },
  complianceDriver: {
    title: "Compliance Driver",
  },
  safety: {
    title: "SAFETY +",
  },
};

/** Column keys that should show revenue text in ownership badges. */
export const REVENUE_COLUMNS = new Set(["complianceAsset", "complianceDriver"]);

/** Engagement opportunity badge styles. */
export const ENGAGEMENT_BADGE_STYLES = {
  closedWon: "border-emerald-300 bg-emerald-50 text-emerald-700",
  closedLost: "border-red-300 bg-red-50 text-red-700",
  open: "border-amber-300 bg-amber-50 text-amber-700",
};

/** Gradient backgrounds used for deterministic contact avatars. */
export const AVATAR_GRADIENTS = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
];

/**
 * KPI panel layout, in display order. Each section becomes a sub-header with an
 * n×2 grid (metric label | value). `format` selects a value formatter in
 * `formatKpiValue`; omit it for plain values.
 */
export const KPI_SECTIONS = [
  {
    id: "customerSatisfaction",
    title: "Customer satisfaction",
    icon: Star,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accentBorder: "border-blue-400",
    metrics: [
      { key: "npsScore", label: "NPS Score" },
      { key: "totalOpenTickets", label: "Total open tickets" },
      { key: "ticketsClosedLast12m", label: "Tickets closed (LTM)" },
      { key: "avgResolutionTimeLast12m", label: "Avg resolution time (LTM)" },
    ],
  },
  {
    id: "financials",
    title: "Financials",
    icon: DollarSign,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accentBorder: "border-emerald-400",
    metrics: [
      { key: "currentArr", label: "Current ARR", format: "currency" },
      {
        key: "yearOverYearGrowthPct",
        label: "YoY Growth Percentage",
        format: "percentage",
      },
      {
        key: "yearOverYearGrowthDiff",
        label: "YoY Growth Difference",
        format: "currency",
      },
    ],
  },
  {
    id: "firmographic",
    title: "Firmographic",
    icon: Briefcase,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accentBorder: "border-violet-400",
    metrics: [
      { key: "operationType", label: "Operation type" },
      { key: "endIndustryCoarse", label: "End industry (Coarse)" },
      { key: "customerFleetSize", label: "Fleet segment" },
      { key: "vehicleCount", label: "Fleet size" },
      { key: "issScore", label: "ISS score category" },
    ],
  },
  {
    id: "regulatoryCompliance",
    title: "Regulatory compliance",
    icon: ShieldCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accentBorder: "border-amber-400",
    metrics: [
      { key: "totalViolations", label: "Total number of violations (LTM)" },
      {
        key: "lastInspectionDate",
        label: "Last inspection date",
        format: "date",
      },
    ],
  },
  {
    id: "csaScores",
    title: "CSA Score Estimates",
    icon: Gauge,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    accentBorder: "border-cyan-400",
    metrics: [
      {
        key: "driverFitnessScore",
        label: "Driver Fitness Score / Percentile",
        format: "scorePercentile",
        threshold: 80,
      },
      {
        key: "hosComplianceScore",
        label: "HOS Compliance Score / Percentile",
        format: "scorePercentile",
        threshold: 65,
      },
      {
        key: "vehicleMaintenanceScore",
        label: "Vehicle Maintenance Score / Percentile",
        format: "scorePercentile",
        threshold: 80,
      },
      {
        key: "unsafeDrivingScore",
        label: "Unsafe Driving Score / Percentile",
        format: "scorePercentile",
        threshold: 65,
      },
    ],
  },
];

/** KPI sections that don't apply to prospect accounts (no customer history yet). */
export const PROSPECT_ACCOUNT_HIDDEN_KPI_SECTION_IDS = new Set([
  "customerSatisfaction",
  "financials",
]);

export const OPERATION_TYPE_OPTIONS = [
  { id: "For-Hire", label: "For-Hire" },
  { id: "Private", label: "Private" },
];

export const TREND_FILTER_OPTIONS = [
  { id: "up", label: "Trending up" },
  { id: "down", label: "Trending down" },
];
