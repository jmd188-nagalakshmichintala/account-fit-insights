import { PRODUCT_FIT_LEGEND } from "../constants/accountProductFit.constants";

export function ProductFitLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {PRODUCT_FIT_LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
