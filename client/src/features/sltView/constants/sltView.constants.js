/** Segment filter options. */
export const SEGMENT_OPTIONS = [
  { id: "SMALL", label: "Small" },
  { id: "MID", label: "Mid" },
  { id: "LARGE", label: "Large" },
  { id: "MEGA", label: "Mega" },
];

/** Product filter options. */
export const PRODUCT_OPTIONS = [
  { id: "Compliance - Asset", label: "Compliance Asset" },
  { id: "Compliance - Driver", label: "Compliance Driver" },
  { id: "Safety", label: "Safety+" },
];

export const SCORE_RANGE_COLORS = {
  high: "fill-emerald-600",
  mid: "fill-amber-600",
  low: "fill-red-600",
};

export const SCORE_RANGE_BG_COLORS = {
  high: "bg-emerald-600",
  mid: "bg-amber-600",
  low: "bg-red-600",
};

export const SCORE_RANGE_LABELS = {
  high: "High fit (8-10)",
  mid: "Mid fit (4-7)",
  low: "Low fit (1-3)",
};

export const SCORE_DISTRIBUTION_DESCRIPTION =
  "Below is a representation of the distribution of propensity scores. This view represents the total number of product fit scores, meaning that each account contributes three scores to the graph, one for each of Compliance - Asset, Compliance - Driver, & Safety+";

export const SCORE_DRILLDOWN_DESCRIPTION =
  "Below is the list of parent accounts that have one or more product fit scores matching the product-fit score that you have clicked. The number of accounts may not match the number of product-fit scores as this may be a one-to-many relationship, as one account can have up to three product-fit scores matching the score selected.";

export const SCORE_DRILLDOWN_NOTE =
  "Note: Child accounts are not represented in this view.";

export const CHART_DIMENSIONS = {
  height: 300,
  width: 1000,
  paddingLeft: 60,
  paddingRight: 20,
  paddingTop: 30,
  paddingBottom: 60,
  gridLines: 7,
  barWidthRatio: 0.65,
  minBarWidth: 56,
};
