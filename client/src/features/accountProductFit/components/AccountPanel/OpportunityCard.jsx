import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCompactDate } from "@/lib/formatters";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

export function OpportunityCard({
  opp,
  badgeStyle,
  badgeText,
  dotColor,
  isLast,
}) {
  const [showProducts, setShowProducts] = useState(false);
  const closedDate = formatCompactDate(opp.opp_closed_date);
  const products = Array.isArray(opp.products) ? opp.products : [];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background",
            dotColor,
          )}
        />
        {!isLast && <span className="w-px flex-1 bg-border" />}
      </div>

      <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {opp.opportunity_name || "—"}
            </p>
            {products.length > 0 && (
              <div className="mt-1">
                <button
                  onClick={() => setShowProducts(!showProducts)}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Products ({products.length})</span>
                  {showProducts ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {showProducts && (
                  <ul className="mt-2 ml-8 list-disc space-y-1">
                    {products.map((product, index) => (
                      <li key={index} className="text-xs text-muted-foreground">
                        {product}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {opp.gong_associated_opportunities_c && (
              <p className="mt-1 text-xs text-muted-foreground">
                {opp.gong_associated_opportunities_c}
              </p>
            )}
            {closedDate && (
              <div className="mt-2 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground/60" />
                <p className="text-[11px] italic text-muted-foreground/90">
                  {closedDate}
                </p>
              </div>
            )}
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              badgeStyle,
            )}
          >
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}
