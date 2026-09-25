import { useFilters } from "../context/FilterContext";
import { ScoreRangeTrendFilter } from "./ScoreRangeTrendFilter";

const SCORE_FILTER_FIELDS = [
  {
    title: "Compliance Asset",
    rangeKey: "complianceAssetRange",
    setRangeKey: "setComplianceAssetRange",
    trendKey: "complianceAssetTrend",
    setTrendKey: "setComplianceAssetTrend",
  },
  {
    title: "Compliance Driver",
    rangeKey: "complianceDriverRange",
    setRangeKey: "setComplianceDriverRange",
    trendKey: "complianceDriverTrend",
    setTrendKey: "setComplianceDriverTrend",
  },
  {
    title: "Safety +",
    rangeKey: "safetyRange",
    setRangeKey: "setSafetyRange",
    trendKey: "safetyTrend",
    setTrendKey: "setSafetyTrend",
  },
];

export function ComplianceScoreFilters() {
  const filters = useFilters();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Score Filters
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-x-12">
        {SCORE_FILTER_FIELDS.map((field) => (
          <ScoreRangeTrendFilter
            key={field.title}
            title={field.title}
            range={filters[field.rangeKey]}
            onRangeChange={filters[field.setRangeKey]}
            trend={filters[field.trendKey]}
            onTrendChange={filters[field.setTrendKey]}
          />
        ))}
      </div>
    </div>
  );
}
