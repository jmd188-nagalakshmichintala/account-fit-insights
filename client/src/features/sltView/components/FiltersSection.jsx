import { LabeledDropdown } from "@/components/ui/LabeledDropdown";
import {
  SEGMENT_OPTIONS,
  PRODUCT_OPTIONS,
} from "../constants/sltView.constants";

export function FiltersSection({
  segmentFilter,
  onSegmentChange,
  salesRepFilter,
  onSalesRepChange,
  salesRepOptions,
  regionFilter,
  onRegionChange,
  regionOptions,
  productFilter,
  onProductChange,
  onClearFilters,
}) {
  const hasActiveFilters =
    segmentFilter || salesRepFilter || regionFilter || productFilter;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
      <LabeledDropdown
        label="Segment"
        options={SEGMENT_OPTIONS}
        value={segmentFilter}
        onChange={onSegmentChange}
        placeholder="All"
        className="w-40 min-w-[10rem]"
      />

      <LabeledDropdown
        label="Sales Rep"
        options={salesRepOptions}
        value={salesRepFilter}
        onChange={onSalesRepChange}
        placeholder="All"
        className="w-50 min-w-[12rem]"
      />

      <LabeledDropdown
        label="Region"
        options={regionOptions}
        value={regionFilter}
        onChange={onRegionChange}
        placeholder="All"
        className="w-40 min-w-[10rem]"
      />

      <LabeledDropdown
        label="Product"
        options={PRODUCT_OPTIONS}
        value={productFilter}
        onChange={onProductChange}
        placeholder="All"
        className="w-48 min-w-[12rem]"
      />

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="ml-auto cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
