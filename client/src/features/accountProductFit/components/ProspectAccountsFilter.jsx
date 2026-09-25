import { CheckboxFilter } from "@/components/ui/CheckboxFilter";

export function ProspectAccountsFilter({ value, onChange }) {
  return (
    <CheckboxFilter
      value={value}
      onChange={onChange}
      label="Prospect accounts only"
      id="prospect-accounts-checkbox"
      ariaLabel="Filter prospect accounts"
    />
  );
}
