import { AlertCircle } from "lucide-react";

/**
 * The metadata line shown under the account name.
 * Shows fleet size and operation type separated by a bullet point.
 * Renders nothing when both are unavailable.
 */
function AccountMetadata({ fleetSize, operationType }) {
  const hasFleetSize = fleetSize != null;
  const hasOperationType = operationType != null && operationType !== "";

  if (!hasFleetSize && !hasOperationType) return null;

  const parts = [];
  if (hasFleetSize) {
    parts.push(`Fleet size: ${fleetSize.toLocaleString("en-US")}`);
  }
  if (hasOperationType) {
    parts.push(operationType);
  }

  return (
    <span className="text-xs font-normal text-muted-foreground">
      {parts.join(" • ")}
    </span>
  );
}

export function DeprioritizedAccountNameCell({ row, isChildRow = false }) {
  return (
    <div>
      <span
        className="block truncate font-semibold"
        title={row.sf_account_name}
      >
        {row.sf_account_name}
      </span>
      <div className="flex items-center gap-2">
        <AccountMetadata
          fleetSize={row.fleet_size}
          operationType={row.operation_type}
        />
        {!isChildRow && row.parent_account_name && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-500"
            title={`Parent account: ${row.parent_account_name}`}
          >
            <AlertCircle className="h-3 w-3 fill-yellow-100" />
            Child account
          </span>
        )}
      </div>
    </div>
  );
}
