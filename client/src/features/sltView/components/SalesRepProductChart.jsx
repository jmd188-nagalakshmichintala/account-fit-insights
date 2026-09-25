import { useMemo } from "react";
import { formatCurrencyCompact } from "@/lib/formatters";
import { ChartGridLines } from "./ChartGridLines";
import { ChartBar } from "./ChartBar";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";
import { ChartYAxisLabel } from "./ChartYAxisLabel";
import { CHART_DIMENSIONS } from "../constants/sltView.constants";
import {
  transformChartData,
  calculateMaxValue,
  formatChartValue,
} from "../utils/chartUtils";
import { useChartTooltip } from "../hooks/useChartTooltip";

export function SalesRepProductChart({
  data = [],
  mode = "products",
  onBarClick,
}) {
  const isArrMode = mode === "potential-arr";

  const chartData = useMemo(
    () => transformChartData(data, isArrMode),
    [data, isArrMode],
  );

  const maxValue = useMemo(
    () => calculateMaxValue(chartData, isArrMode),
    [chartData, isArrMode],
  );

  const {
    hoveredBar,
    tooltipData,
    tooltipPosition,
    handleBarHover,
    handleBarLeave,
  } = useChartTooltip();

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const {
    height: chartHeight,
    width: baseChartWidth,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    gridLines,
    barWidthRatio,
    minBarWidth,
  } = CHART_DIMENSIONS;

  // Once there are enough reps that a fixed-width chart would squeeze bars
  // (and their value/initial labels) past legibility, grow the chart instead
  // and let it scroll horizontally rather than keep shrinking every bar.
  const chartWidth = Math.max(
    baseChartWidth,
    paddingLeft + paddingRight + chartData.length * minBarWidth,
  );
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const barWidth = plotWidth / chartData.length;
  const barActualWidth = barWidth * barWidthRatio;

  return (
    <div className="relative">
      <ChartYAxisLabel
        label={isArrMode ? "Potential ARR" : "Number of Accounts"}
      />

      <div className="ml-12 mr-4">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-96"
            style={{ width: `max(100%, ${chartWidth}px)` }}
            preserveAspectRatio="xMidYMid meet"
          >
            <ChartGridLines
              gridLines={gridLines}
              maxValue={maxValue}
              paddingLeft={paddingLeft}
              paddingTop={paddingTop}
              plotHeight={plotHeight}
              chartWidth={chartWidth}
              paddingRight={paddingRight}
              formatValue={(v) => formatChartValue(v, isArrMode)}
            />

            {chartData.map((rep, index) => (
              <ChartBar
                key={rep.initials}
                rep={rep}
                index={index}
                barWidth={barWidth}
                barActualWidth={barActualWidth}
                paddingLeft={paddingLeft}
                paddingTop={paddingTop}
                plotHeight={plotHeight}
                maxValue={maxValue}
                hoveredBar={hoveredBar}
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
                onBarClick={onBarClick} // same rep+bucket drilldown on both the Accounts and Potential ARR tabs
                formatValue={(v) => formatChartValue(v, isArrMode)}
              />
            ))}
          </svg>
        </div>

        <div className="font-semibold text-center text-md font-medium text-muted-foreground">
          Sales Rep
        </div>

        <ChartLegend />
      </div>

      <ChartTooltip
        tooltipData={tooltipData}
        tooltipPosition={tooltipPosition}
        formatValue={isArrMode ? formatCurrencyCompact : (v) => v}
        isArrMode={isArrMode}
      />
    </div>
  );
}
