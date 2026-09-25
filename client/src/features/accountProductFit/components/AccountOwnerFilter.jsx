import { MultiSelect } from "@/components/ui/MultiSelect";

/**
 * Standalone Account Owner filter shown on the left of the legend row. An inline
 * label + multi-select of account owners; selecting one or more filters the
 * table and the summary metrics (the same behaviour the column-header filter
 * had before it was lifted out of the table).
 */
export function AccountOwnerFilter({ options, selectedIds, onChange }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Account Owner
      </span>
      <MultiSelect
        options={options}
        selectedIds={selectedIds}
        onChange={onChange}
        placeholder="All owners"
        searchPlaceholder="Search owners…"
        emptyMessage="No owners"
        align="start"
        className="w-56"
      />
    </div>
  );
}
