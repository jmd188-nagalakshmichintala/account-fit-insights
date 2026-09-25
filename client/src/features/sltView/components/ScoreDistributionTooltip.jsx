import { formatCurrencyCompact } from "@/lib/formatters";

export function ScoreDistributionTooltip({
  tooltipData,
  tooltipPosition,
  isArrMode,
  showOpenOpportunity,
}) {
  if (!tooltipData) return null;

  const nonOpenValue = tooltipData.value - tooltipData.openValue;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="font-semibold">Score {tooltipData.score}</div>
      <div className="mt-1 text-slate-300">{tooltipData.rangeLabel}</div>
      {showOpenOpportunity ? (
        <>
          <div className="mt-1 font-semibold">
            Open opportunity:{" "}
            {isArrMode
              ? formatCurrencyCompact(tooltipData.openValue)
              : tooltipData.openValue}
          </div>
          <div className="mt-1 font-semibold">
            {isArrMode
              ? "Potential ARR w/o opportunity"
              : "Products w/o opportunity"}
            : {isArrMode ? formatCurrencyCompact(nonOpenValue) : nonOpenValue}
          </div>
        </>
      ) : (
        <div className="mt-1 font-semibold">
          {isArrMode ? "Potential ARR" : "Products"}:{" "}
          {isArrMode
            ? formatCurrencyCompact(tooltipData.value)
            : tooltipData.value}
        </div>
      )}
    </div>
  );
}
