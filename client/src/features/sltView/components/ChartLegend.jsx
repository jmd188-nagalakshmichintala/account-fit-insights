import {
  SCORE_RANGE_BG_COLORS,
  SCORE_RANGE_LABELS,
} from "../constants/sltView.constants";

export function ChartLegend() {
  return (
    <div className="mt-4 flex gap-6 text-xs">
      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-sm ${SCORE_RANGE_BG_COLORS.high}`}
        />
        <span className="text-muted-foreground">{SCORE_RANGE_LABELS.high}</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-sm ${SCORE_RANGE_BG_COLORS.mid}`}
        />
        <span className="text-muted-foreground">{SCORE_RANGE_LABELS.mid}</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-sm ${SCORE_RANGE_BG_COLORS.low}`}
        />
        <span className="text-muted-foreground">{SCORE_RANGE_LABELS.low}</span>
      </div>
    </div>
  );
}
