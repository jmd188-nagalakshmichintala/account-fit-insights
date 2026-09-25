import { AccountNameCell } from "./cells/AccountNameCell";
import { AccountFitCell } from "./cells/AccountFitCell";
import { ComplianceCell } from "./cells/ComplianceCell";
import { PotentialArrCell } from "./cells/PotentialArrCell";
import { ExpanderToggle } from "./cells/ExpanderToggle";

/** Left padding applied to a child row's account name, so it reads as nested under its topAccount. */
const CHILD_ROW_INDENT_PX = 28;

export function getAccountProductFitColumns({
  isGroupExpanded,
  onToggleGroupExpand,
} = {}) {
  return [
    {
      id: "expander",
      header: "",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <ExpanderToggle
          hasChildren={Boolean(row.original.__childAccounts?.length)}
          isExpanded={isGroupExpanded?.(row.original.id) ?? false}
          onToggle={onToggleGroupExpand}
          rowId={row.original.id}
        />
      ),
      meta: {
        className: "w-4",
      },
    },

    {
      accessorKey: "account",
      header: "Account Name",
      enableSorting: false,
      enableColumnFilter: true,
      filterMeta: {
        type: "search",
        placeholder: "Search account name…",
      },
      cell: ({ row }) =>
        row.original.isChildRow ? (
          <div style={{ paddingLeft: CHILD_ROW_INDENT_PX }}>
            <AccountNameCell row={row.original} />
          </div>
        ) : (
          <AccountNameCell row={row.original} />
        ),
    },

    {
      accessorKey: "accountFit",
      header: "Account Fit",
      enableSorting: true,
      cell: ({ getValue }) => <AccountFitCell fit={getValue()} />,
      meta: {
        className: "text-center",
      },
    },

    {
      accessorKey: "complianceAsset",
      header: "Compliance Asset",
      enableSorting: true,
      cell: ({ row }) => (
        <ComplianceCell row={row.original} columnKey="complianceAsset" />
      ),
      meta: {
        className: "text-center",
      },
    },

    {
      accessorKey: "complianceDriver",
      header: "Compliance Driver",
      enableSorting: true,
      cell: ({ row }) => (
        <ComplianceCell row={row.original} columnKey="complianceDriver" />
      ),
      meta: {
        className: "text-center",
      },
    },

    {
      accessorKey: "safety",
      header: "SAFETY +",
      enableSorting: true,
      cell: ({ row }) => (
        <ComplianceCell row={row.original} columnKey="safety" />
      ),
      meta: {
        className: "text-center",
      },
    },

    {
      accessorKey: "potentialArr",
      header: "Potential ARR",
      enableSorting: true,
      cell: ({ row }) => (
        <PotentialArrCell
          value={row.original.potentialArr}
          breakdown={row.original.potentialArrBreakdown}
        />
      ),
      meta: {
        className: "text-center",
      },
    },
  ];
}
