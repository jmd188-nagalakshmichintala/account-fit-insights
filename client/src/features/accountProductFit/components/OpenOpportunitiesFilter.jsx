import { CheckboxFilter } from "@/components/ui/CheckboxFilter";

export function OpenOpportunitiesFilter({ value, onChange }) {
  return (
    <CheckboxFilter
      value={value}
      onChange={onChange}
      label="Open opportunities only"
      id="open-opportunities-checkbox"
      ariaLabel="Filter accounts by open opportunities"
    />
  );
}
