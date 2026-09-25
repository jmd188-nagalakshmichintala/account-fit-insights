import { Tooltip } from "@/components/ui/Tooltip";

export function ProductMetadataTooltip({ children, metadata }) {
  if (!metadata || metadata.length === 0) {
    return children;
  }

  return (
    <Tooltip
      side="right"
      width={260}
      content={
        <ul className="space-y-1.5 p-3">
          {metadata.map(({ label, value }) => (
            <li
              key={label}
              className="flex items-start justify-between gap-6 text-xs"
            >
              <span className="flex items-start gap-1.5 text-slate-500">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                <span>{label}</span>
              </span>
              <span className="font-medium text-slate-900">{value}</span>
            </li>
          ))}
        </ul>
      }
    >
      {children}
    </Tooltip>
  );
}
