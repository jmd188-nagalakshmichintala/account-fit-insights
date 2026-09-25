import { ProductFitLegend } from "./ProductFitLegend";
import { AdvancedFiltersAccordion } from "./AdvancedFiltersAccordion";

export function FiltersBar({ ownerOptions, canFilterByOwner = true }) {
  return (
    <div className="mb-3 space-y-3">
      <div className="flex items-center justify-end">
        <ProductFitLegend />
      </div>

      <AdvancedFiltersAccordion
        ownerOptions={ownerOptions}
        canFilterByOwner={canFilterByOwner}
        defaultOpen={false}
      />
    </div>
  );
}
