import { formatCurrencyCompact } from "@/lib/formatters";
import { Tooltip } from "@/components/ui/Tooltip";

export function PotentialArrCell({ value, breakdown = [] }) {
  const arrValue = (
    <span className="font-semibold text-emerald-700">
      {formatCurrencyCompact(value)}
    </span>
  );

  // No per-product splits to show → render the plain value.
  if (breakdown.length === 0) return arrValue;

  return (
    <Tooltip
      side="bottom"
      width={220}
      className="cursor-pointer"
      content={
        <ul className="space-y-1.5 p-3">
          {breakdown.map(({ label, value: productArr }) => (
            <li
              key={label}
              className="flex items-center justify-between gap-6 text-xs"
            >
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                {label}
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrencyCompact(productArr)}
              </span>
            </li>
          ))}
        </ul>
      }
    >
      {arrValue}
    </Tooltip>
  );
}
