import { Modal } from "@/components/ui/Modal";
import {
  MIN_SCORE_FOR_KEY_SIGNALS,
  NOT_A_FIT_SCORE_RANGE,
} from "../constants/accountProductFit.constants";
import { SafetyCell } from "./cells/SafetyCell";

export function RulesAnalysisModal({
  open,
  onClose,
  productName = "",
  score = "",
  rulesFired = [],
  rulesNotFired = [],
}) {
  const MAX_RULES_SHOWN = 6;
  const topRulesFired = rulesFired.slice(0, MAX_RULES_SHOWN);

  const modalTitle = (
    <div className="flex items-center gap-3">
      <span>{productName}</span>
      <SafetyCell value={Number(score)} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} maxWidth={700}>
      <div className="space-y-6">
        {/* Section 1: Key Signals (Positive - Green) */}
        {Number(score) >= MIN_SCORE_FOR_KEY_SIGNALS && (
          <section>
            <h3 className="text-base font-semibold text-emerald-700 mb-3">
              Key Signals
            </h3>
            {topRulesFired.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-emerald-600">
                {topRulesFired.map((rule, index) => (
                  <li key={`fired-${index}`}>{rule}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No key signals available.
              </p>
            )}
          </section>
        )}

        {/* Section 2: Why Not a Fit (Negative - Red) */}
        {Number(score) >= NOT_A_FIT_SCORE_RANGE.min &&
          Number(score) <= NOT_A_FIT_SCORE_RANGE.max && (
            <section>
              <h3 className="text-base font-semibold text-red-700 mb-3">
                Customer&apos;s score would be higher if
              </h3>
              {rulesNotFired.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-red-600">
                  {rulesNotFired.map((rule, index) => (
                    <li key={`not-fired-${index}`}>{rule}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No negative signals available.
                </p>
              )}
            </section>
          )}
      </div>
    </Modal>
  );
}
