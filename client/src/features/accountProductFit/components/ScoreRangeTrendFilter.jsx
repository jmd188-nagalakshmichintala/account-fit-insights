import { DualRangeSlider } from "@/components/ui/DualRangeSlider";
import { Dropdown } from "@/components/ui/Dropdown";
import { TREND_FILTER_OPTIONS } from "../constants/accountProductFit.constants";

export function ScoreRangeTrendFilter({
  title,
  range,
  onRangeChange,
  trend,
  onTrendChange,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>

      <DualRangeSlider
        min={0}
        max={10}
        step={1}
        value={range}
        onChange={onRangeChange}
        label="Score Range"
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Score Trend
        </span>
        <Dropdown
          options={TREND_FILTER_OPTIONS}
          value={trend || ""}
          onChange={onTrendChange}
          placeholder="All"
        />
      </div>
    </div>
  );
}
