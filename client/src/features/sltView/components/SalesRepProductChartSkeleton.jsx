/**
 * Loading skeleton for the Sales Rep Product Chart.
 * Shows placeholder bars and axes while data is being fetched.
 */
export function SalesRepProductChartSkeleton() {
  const chartHeight = 240;
  const chartWidth = 1000;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 60;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const numBars = 8; // Show 8 placeholder bars
  const barWidth = plotWidth / numBars;
  const barActualWidth = barWidth * 0.65;
  const gridLines = 5;

  return (
    <div className="relative animate-pulse">
      {/* Y-axis label skeleton */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90">
        <div className="h-3 w-32 rounded bg-slate-200" />
      </div>

      {/* Chart container */}
      <div className="ml-12 mr-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-80 w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines skeleton */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const y = paddingTop + (i / gridLines) * plotHeight;
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
                {/* Y-axis label skeleton */}
                <rect
                  x={paddingLeft - 45}
                  y={y - 6}
                  width="35"
                  height="12"
                  fill="#e2e8f0"
                  rx="2"
                />
              </g>
            );
          })}

          {/* Placeholder bars */}
          {Array.from({ length: numBars }).map((_, index) => {
            const x = paddingLeft + index * barWidth;
            const barX = x + (barWidth - barActualWidth) / 2;

            // Random heights for visual variety
            const heights = [0.7, 0.85, 0.6, 0.75, 0.9, 0.65, 0.8, 0.7];
            const barHeight = plotHeight * heights[index % heights.length];

            return (
              <g key={index}>
                {/* Skeleton bar */}
                <rect
                  x={barX}
                  y={paddingTop + plotHeight - barHeight}
                  width={barActualWidth}
                  height={barHeight}
                  fill="#e2e8f0"
                  rx="3"
                />

                {/* Count skeleton on top */}
                <rect
                  x={barX + barActualWidth / 2 - 12}
                  y={paddingTop + plotHeight - barHeight - 18}
                  width="24"
                  height="10"
                  fill="#cbd5e1"
                  rx="2"
                />

                {/* X-axis label skeleton */}
                <rect
                  x={x + barWidth / 2 - 10}
                  y={paddingTop + plotHeight + 14}
                  width="20"
                  height="12"
                  fill="#e2e8f0"
                  rx="2"
                />
              </g>
            );
          })}
        </svg>

        {/* X-axis label skeleton */}
        <div className="mt-2 flex justify-center">
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>

        {/* Legend skeleton */}
        <div className="mt-4 flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
              <div className="h-3 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
