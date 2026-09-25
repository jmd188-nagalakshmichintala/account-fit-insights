import { cn } from "@/lib/utils";
import { SCORE_RANGE_COLORS } from "../constants/sltView.constants";

export function ChartBar({
  rep,
  index,
  barWidth,
  barActualWidth,
  paddingLeft,
  paddingTop,
  plotHeight,
  maxValue,
  hoveredBar,
  onBarHover,
  onBarLeave,
  onBarClick, // opens the same rep+bucket drilldown on both Accounts and ARR bars
  formatValue = (v) => Math.round(v),
}) {
  const x = paddingLeft + index * barWidth;
  const barX = x + (barWidth - barActualWidth) / 2;

  const highHeight = (rep.high / maxValue) * plotHeight;
  const midHeight = (rep.mid / maxValue) * plotHeight;
  const lowHeight = (rep.low / maxValue) * plotHeight;
  const totalHeight = highHeight + midHeight + lowHeight;

  let currentY = paddingTop + plotHeight;

  return (
    <g key={rep.initials}>
      {rep.low > 0 && (
        <rect
          x={barX}
          y={currentY - lowHeight}
          width={barActualWidth}
          height={lowHeight}
          className={cn(
            "cursor-pointer transition-opacity",
            SCORE_RANGE_COLORS.low,
            hoveredBar && hoveredBar !== `${rep.initials}-low` && "opacity-50",
          )}
          onMouseEnter={(e) => onBarHover(rep, "low", e)}
          onMouseLeave={onBarLeave}
          onClick={() => onBarClick?.(rep, "low")}
        />
      )}
      {(currentY -= lowHeight)}

      {rep.mid > 0 && (
        <rect
          x={barX}
          y={currentY - midHeight}
          width={barActualWidth}
          height={midHeight}
          className={cn(
            "cursor-pointer transition-opacity",
            SCORE_RANGE_COLORS.mid,
            hoveredBar && hoveredBar !== `${rep.initials}-mid` && "opacity-50",
          )}
          onMouseEnter={(e) => onBarHover(rep, "mid", e)}
          onMouseLeave={onBarLeave}
          onClick={() => onBarClick?.(rep, "mid")}
        />
      )}
      {(currentY -= midHeight)}

      {rep.high > 0 && (
        <rect
          x={barX}
          y={currentY - highHeight}
          width={barActualWidth}
          height={highHeight}
          className={cn(
            "cursor-pointer transition-opacity",
            SCORE_RANGE_COLORS.high,
            hoveredBar && hoveredBar !== `${rep.initials}-high` && "opacity-50",
          )}
          onMouseEnter={(e) => onBarHover(rep, "high", e)}
          onMouseLeave={onBarLeave}
          onClick={() => onBarClick?.(rep, "high")}
        />
      )}

      {rep.total > 0 && (
        <text
          x={barX + barActualWidth / 2}
          y={paddingTop + plotHeight - totalHeight - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#1a1d23"
          fontWeight="600"
          fontFamily="monospace"
        >
          {formatValue(rep.total)}
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
        {rep.initials}
      </text>
    </g>
  );
}
