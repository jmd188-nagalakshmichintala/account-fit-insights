import { Dropdown } from "./Dropdown";

export function LabeledDropdown({ label, className, ...dropdownProps }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Dropdown className={className} {...dropdownProps} />
    </div>
  );
}
