import { Tooltip } from "@/components/ui/Tooltip";

export function RulesNotFiredTooltip({ children, rulesNotFired }) {
  if (!rulesNotFired || rulesNotFired.length === 0) {
    return children;
  }

  // Show only the first 3 rules
  const rulesToShow = rulesNotFired.slice(0, 3);

  return (
    <Tooltip
      side="right"
      width={280}
      content={
        <div className="p-3">
          <div className="mb-2 text-xs font-semibold text-red-700">
            Customer&apos;s score would be higher if
          </div>
          <ul className="space-y-2">
            {rulesToShow.map((rule, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-slate-600"
              >
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}
