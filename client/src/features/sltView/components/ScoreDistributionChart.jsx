import { useMemo, useState } from "react";
import { ChartGridLines } from "./ChartGridLines";
import { ChartYAxisLabel } from "./ChartYAxisLabel";
import { ChartLegend } from "./ChartLegend";
import { ScoreBar } from "./ScoreBar";
import { ScoreDistributionTooltip } from "./ScoreDistributionTooltip";
import {
  CHART_DIMENSIONS,
  SCORE_RANGE_LABELS,
} from "../constants/sltView.constants";
import { formatChartValue, calculateNiceYAxisMax } from "../utils/chartUtils";

export function ScoreDistributionChart({
  data = [],
  mode = "products",
  showOpenOpportunity = false,
  onBarClick,
}) {
  const isArrMode = mode === "potential-arr";
  const [hoveredScore, setHoveredScore] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const scores = Array.from({ length: 10 }, (_, i) => i + 1);
    return scores.map((score) => {
      const item = data.find((d) => d.score === score);
      return {
        score,
        value: isArrMode ? item?.totalArr || 0 : item?.productCount || 0,
        openValue: isArrMode ? item?.openArr || 0 : item?.openProductCount || 0,
      };
    });
  }, [data, isArrMode]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value), 1);
    const minValue = isArrMode ? 10000 : 10;
    const rawMax = Math.max(max, minValue);
    return calculateNiceYAxisMax(rawMax);
  }, [chartData, isArrMode]);

  const getScoreRangeLabel = (score) => {
    if (score >= 8) return SCORE_RANGE_LABELS.high;
    if (score >= 4) return SCORE_RANGE_LABELS.mid;
    return SCORE_RANGE_LABELS.low;
  };

  const handleBarHover = (item, event) => {
    setHoveredScore(item.score);
    setTooltipData({
      score: item.score,
      rangeLabel: getScoreRangeLabel(item.score),
      value: item.value,
      openValue: item.openValue,
    });

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleBarLeave = () => {
    setHoveredScore(null);
    setTooltipData(null);
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const {
    height: chartHeight,
    width: chartWidth,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    gridLines,
  } = CHART_DIMENSIONS;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const barWidth = plotWidth / 10;
  const barActualWidth = barWidth * 0.7;

  return (
    <div className="relative">
      <ChartYAxisLabel
        label={isArrMode ? "Potential ARR" : "Number of Products"}
      />

      <div className="ml-12 mr-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-96 w-full"
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

          {chartData.map((item, index) => (
            <ScoreBar
              key={item.score}
              item={item}
              index={index}
              isArrMode={isArrMode}
              showOpenOpportunity={showOpenOpportunity}
              maxValue={maxValue}
              hoveredScore={hoveredScore}
              onBarHover={handleBarHover}
              onBarLeave={handleBarLeave}
              onBarClick={onBarClick}
              barWidth={barWidth}
              barActualWidth={barActualWidth}
              paddingLeft={paddingLeft}
              paddingTop={paddingTop}
              plotHeight={plotHeight}
            />
          ))}
        </svg>

        <div className="font-semibold text-center text-md font-medium text-muted-foreground">
          Propensity Score
        </div>

        <ChartLegend />
      </div>

      <ScoreDistributionTooltip
        tooltipData={tooltipData}
        tooltipPosition={tooltipPosition}
        isArrMode={isArrMode}
        showOpenOpportunity={showOpenOpportunity}
      />
    </div>
  );
}
