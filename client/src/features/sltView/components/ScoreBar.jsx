import { SCORE_RANGE_COLORS } from "../constants/sltView.constants";
import { formatChartValue } from "../utils/chartUtils";

export function ScoreBar({
  item,
  index,
  isArrMode,
  showOpenOpportunity,
  maxValue,
  hoveredScore,
  onBarHover,
  onBarLeave,
  onBarClick,
  barWidth,
  barActualWidth,
  paddingLeft,
  paddingTop,
  plotHeight,
}) {
  const getScoreColor = (score) => {
    if (score >= 8) return SCORE_RANGE_COLORS.high;
    if (score >= 4) return SCORE_RANGE_COLORS.mid;
    return SCORE_RANGE_COLORS.low;
  };

  const x = paddingLeft + index * barWidth;
  const barX = x + (barWidth - barActualWidth) / 2;

  if (showOpenOpportunity) {
    const nonOpenValue = item.value - item.openValue;
    const openHeight = (item.openValue / maxValue) * plotHeight;
    const nonOpenHeight = (nonOpenValue / maxValue) * plotHeight;
    const totalHeight = openHeight + nonOpenHeight;

    let currentY = paddingTop + plotHeight;

    return (
      <g key={item.score}>
        {nonOpenValue > 0 && (
          <rect
            x={barX}
            y={currentY - nonOpenHeight}
            width={barActualWidth}
            height={nonOpenHeight}
            className={`cursor-pointer transition-opacity fill-slate-300 ${hoveredScore && hoveredScore !== item.score ? "opacity-50" : ""}`}
            onMouseEnter={(e) => onBarHover(item, e)}
            onMouseLeave={onBarLeave}
            onClick={() => onBarClick?.(item, false)}
          />
        )}
        {(currentY -= nonOpenHeight)}

        {item.openValue > 0 && (
          <rect
            x={barX}
            y={currentY - openHeight}
            width={barActualWidth}
            height={openHeight}
            className={`cursor-pointer transition-opacity ${getScoreColor(item.score)} ${hoveredScore && hoveredScore !== item.score ? "opacity-50" : ""}`}
            onMouseEnter={(e) => onBarHover(item, e)}
            onMouseLeave={onBarLeave}
            onClick={() => onBarClick?.(item, true)}
          />
        )}

        {item.value > 0 && (
          <text
            x={barX + barActualWidth / 2}
            y={paddingTop + plotHeight - totalHeight - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#1a1d23"
            fontWeight="600"
            fontFamily="monospace"
          >
            {formatChartValue(item.value, isArrMode)}
          </text>
        )}

        <text
          x={x + barWidth / 2}
          y={paddingTop + plotHeight + 20}
          textAnchor="middle"
          fontSize="11.5"
          fill="#6b7280"
          fontWeight="500"
        >
          {item.score}
        </text>
      </g>
    );
  }

  const barHeight = (item.value / maxValue) * plotHeight;
  const barY = paddingTop + plotHeight - barHeight;

  return (
    <g key={item.score}>
      {item.value > 0 && (
        <>
          <rect
            x={barX}
            y={barY}
            width={barActualWidth}
            height={barHeight}
            className={`cursor-pointer transition-opacity ${getScoreColor(item.score)} ${hoveredScore && hoveredScore !== item.score ? "opacity-50" : ""}`}
            onMouseEnter={(e) => onBarHover(item, e)}
            onMouseLeave={onBarLeave}
            onClick={() => onBarClick?.(item, null)}
          />
          <text
            x={barX + barActualWidth / 2}
            y={barY - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#1a1d23"
            fontWeight="600"
            fontFamily="monospace"
          >
            {formatChartValue(item.value, isArrMode)}
          </text>
        </>
      )}

      <text
        x={x + barWidth / 2}
        y={paddingTop + plotHeight + 20}
        textAnchor="middle"
        fontSize="11.5"
        fill="#6b7280"
        fontWeight="500"
      >
        {item.score}
      </text>
    </g>
  );
}
