import { CheckboxFilter } from "@/components/ui/CheckboxFilter";

export function Top100Filter({ value, onChange }) {
  return (
    <CheckboxFilter
      value={value}
      onChange={onChange}
      label="Top 100 customers only"
      id="top-100-checkbox"
      ariaLabel="Filter top 100 customers"
    />
  );
}
