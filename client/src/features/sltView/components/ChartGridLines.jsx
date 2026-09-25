export function ChartGridLines({
  gridLines,
  maxValue,
  paddingLeft,
  paddingTop,
  plotHeight,
  chartWidth,
  paddingRight,
  formatValue = (v) => Math.round(v),
}) {
  return (
    <>
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = paddingTop + (i / gridLines) * plotHeight;
        const rawValue = maxValue - (i / gridLines) * maxValue;
        const value = formatValue(rawValue);
        return (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={chartWidth - paddingRight}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9ca3af"
              fontFamily="monospace"
            >
              {value}
            </text>
          </g>
        );
      })}
    </>
  );
}
