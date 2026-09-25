import { CheckboxFilter } from "@/components/ui/CheckboxFilter";

export function ExistingAccountsFilter({ value, onChange }) {
  return (
    <CheckboxFilter
      value={value}
      onChange={onChange}
      label="Existing accounts only"
      id="existing-accounts-checkbox"
      ariaLabel="Filter existing accounts"
    />
  );
}
