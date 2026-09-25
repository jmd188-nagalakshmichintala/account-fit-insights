import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./DualRangeSlider.css";

export function DualRangeSlider({
  min = 0,
  max = 100,
  step = 1,
  value = [min, max],
  onChange,
  label,
  showValues = true,
  className,
}) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef(null);

  const getPercent = useCallback(
    (val) => Math.round(((val - min) / (max - min)) * 100),
    [min, max],
  );

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(val);
    minValRef.current = val;
    onChange?.([val, maxVal]);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(val);
    maxValRef.current = val;
    onChange?.([minVal, val]);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
      )}

      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />

        <div
          ref={range}
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-400"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          aria-label={`${label} minimum value`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minVal}
          className="dual-range-slider-input"
          style={{ zIndex: minVal > max - 100 / 2 ? 5 : 3 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          aria-label={`${label} maximum value`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxVal}
          className="dual-range-slider-input"
          style={{ zIndex: 4 }}
        />
      </div>

      {showValues && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{min}</span>
          <span className="font-semibold text-blue-400">
            {minVal} – {maxVal}
          </span>
          <span className="text-muted-foreground">{max}</span>
        </div>
      )}
    </div>
  );
}
