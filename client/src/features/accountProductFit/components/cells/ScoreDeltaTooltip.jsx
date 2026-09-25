import { TrendingDown, TrendingUp } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatMonthYear } from "../../utils/productFitFormatting.utils";

/** Show at most this many rules in the trending icon tooltip. */
const MAX_RULES_SHOWN = 3;

/**
 * Wraps a score badge with a trending icon when the score recently changed:
 * trending-up when it increased, trending-down when it decreased. `deltaScore`
 * is the signed size of the change; the previous score is derived as
 * `currentScore - deltaScore`. `previousMonth`/`currentMonth` are optional
 * month-level dates (e.g. "2026-06-01") shown alongside each score.
 * `newFiredRules` (shown on an increase) and `newNotFiredRules` (shown on a
 * decrease) are the rules that newly started/stopped firing since the
 * previous month, explaining *why* the score moved. Renders `children`
 * untouched when there was no change.
 */
export function ScoreDeltaTooltip({
  deltaScore,
  currentScore,
  previousMonth,
  currentMonth,
  newFiredRules,
  newNotFiredRules,
  children,
}) {
  const delta = Number(deltaScore);

  if (!delta || currentScore == null) return children;

  const isIncrease = delta > 0;
  const previousScore = Number(currentScore) - delta;
  const previousMonthLabel = formatMonthYear(previousMonth);
  const currentMonthLabel = formatMonthYear(currentMonth);
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;
  const iconColorClass = isIncrease
    ? "text-emerald-500 group-hover:text-emerald-600"
    : "text-red-500 group-hover:text-red-600";

  const rules = (isIncrease ? newFiredRules : newNotFiredRules) || [];
  const rulesToShow = rules.slice(0, MAX_RULES_SHOWN);
  const rulesHeading = isIncrease
    ? "New rules fired that drove the increase"
    : "Rules that are no longer firing";
  const rulesHeadingColorClass = isIncrease ? "text-green-600" : "text-red-700";

  return (
    <Tooltip
      side="top"
      width={280}
      className="group cursor-pointer"
      content={
        <div className="p-3">
          <p className="text-xs text-slate-600">
            Score {isIncrease ? "increased" : "decreased"} from{" "}
            <span className="font-medium text-slate-900">
              {previousScore}
              {previousMonthLabel !== "-" && ` (${previousMonthLabel})`}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900">
              {Number(currentScore)}
              {currentMonthLabel !== "-" && ` (${currentMonthLabel})`}
            </span>
          </p>

          {rulesToShow.length > 0 && (
            <>
              <div
                className={`mt-3 mb-2 text-xs font-semibold ${rulesHeadingColorClass}`}
              >
                {rulesHeading}
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
            </>
          )}
        </div>
      }
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <TrendIcon className={`h-6 w-6 transition-colors ${iconColorClass}`} />
      </span>
    </Tooltip>
  );
}
