import { SCORE_RANGE_LABELS } from "../constants/sltView.constants";

export function ChartTooltip({
  tooltipData,
  tooltipPosition,
  formatValue = (v) => v,
  isArrMode = false,
}) {
  if (!tooltipData) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="font-semibold">{tooltipData.ownerName}</div>
      <div className="mt-1 text-slate-300">
        {SCORE_RANGE_LABELS[tooltipData.segment]}
      </div>
      <div className="mt-1 space-y-0.5">
        {Object.entries(tooltipData.scoreRange)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([score, count]) => (
            <div key={score} className="text-slate-200">
              Score {score}: <strong>{formatValue(count)}</strong>
            </div>
          ))}
      </div>
      <div className="mt-1 border-t border-slate-700 pt-1 font-semibold">
        {isArrMode ? "Band total ARR" : "Band total"}:{" "}
        {formatValue(tooltipData.count)}
      </div>
    </div>
  );
}
