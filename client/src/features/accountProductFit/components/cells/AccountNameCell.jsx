import { AlertCircle, Star } from "lucide-react";

export function AccountNameCell({ row }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="truncate font-semibold" title={row.account}>
          {row.account}
        </span>
        {row.isTop100 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
            <Star className="h-3 w-3 fill-amber-500" />
            TOP 100
          </span>
        )}
      </div>
      {(row.fleetSize != null || row.operation) && (
        <span className="text-xs font-normal text-muted-foreground">
          {row.fleetSize != null &&
            `Fleet size: ${row.fleetSize.toLocaleString("en-US")}`}
          {row.fleetSize != null && row.operation && ", "}
          {row.operation && `Fleet type: ${row.operation}`}
        </span>
      )}
      <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
        {`Account type: ${row.isProspectAccount ? "Prospect" : "Existing"}`}
        {row.hasParent === false && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-500"
            title="Parent account is not scored"
          >
            <AlertCircle className="h-3 w-3 fill-yellow-100" />
            Child account
          </span>
        )}
      </span>
    </div>
  );
}
