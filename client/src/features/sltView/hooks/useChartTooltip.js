import { useState } from "react";

export function useChartTooltip() {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleBarHover = (rep, segment, event) => {
    setHoveredBar(`${rep.initials}-${segment}`);

    const scoreRange =
      segment === "high"
        ? rep.highScores
        : segment === "mid"
          ? rep.midScores
          : rep.lowScores;

    setTooltipData({
      ownerName: rep.ownerName,
      segment,
      count: rep[segment],
      scoreRange,
    });

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleBarLeave = () => {
    setHoveredBar(null);
    setTooltipData(null);
  };

  return {
    hoveredBar,
    tooltipData,
    tooltipPosition,
    handleBarHover,
    handleBarLeave,
  };
}
