import { useState } from "react";
import {
  COMPLIANCE_TOOLTIP_CONFIG,
  COMPLIANCE_DELTA_SCORE_KEY_MAP,
  COMPLIANCE_LATEST_MONTH_KEY_MAP,
  COMPLIANCE_METADATA_KEY_MAP,
  COMPLIANCE_NEW_FIRED_RULES_KEY_MAP,
  COMPLIANCE_NEW_NOT_FIRED_RULES_KEY_MAP,
  COMPLIANCE_RULES_KEY_MAP,
  COMPLIANCE_SECOND_LATEST_MONTH_KEY_MAP,
  PRODUCT_FIT_VALUES,
} from "../../constants/accountProductFit.constants";
import { RulesAnalysisModal } from "../RulesAnalysisModal";
import { ComplianceCellContent } from "./ComplianceCellContent";
import { ComplianceCellTooltip } from "./ComplianceCellTooltip";
import { ScoreDeltaTooltip } from "./ScoreDeltaTooltip";

function getRulesForColumn(row, columnKey) {
  const keys = COMPLIANCE_RULES_KEY_MAP[columnKey];

  return {
    rulesFired: (keys && row[keys.fired]) || [],
    rulesNotFired: (keys && row[keys.notFired]) || [],
  };
}

export function ComplianceCell({ row, columnKey }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const value = row[columnKey];
  const productName = COMPLIANCE_TOOLTIP_CONFIG[columnKey]?.title || columnKey;
  const isOwned = value === PRODUCT_FIT_VALUES.Owned;
  const isLowScore = Number(value) === 1;
  const hasRules = !isOwned && (isLowScore || Number(value) >= 2);

  const metadata = isOwned
    ? row[COMPLIANCE_METADATA_KEY_MAP[columnKey]] || []
    : [];
  const { rulesFired, rulesNotFired } = hasRules
    ? getRulesForColumn(row, columnKey)
    : { rulesFired: [], rulesNotFired: [] };

  const handleClick = (e) => {
    if (!hasRules) return;
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    handleClick(e);
  };

  const deltaScore = row[COMPLIANCE_DELTA_SCORE_KEY_MAP[columnKey]];
  const showDelta =
    !isOwned && Number(deltaScore) !== 0 && !Number.isNaN(Number(deltaScore));

  const cellContent = (
    <ComplianceCellContent
      value={value}
      columnKey={columnKey}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      hasRules={hasRules}
      productName={productName}
    />
  );

  return (
    <div className="relative inline-flex items-center justify-center">
      <ComplianceCellTooltip
        isOwned={isOwned}
        isLowScore={isLowScore}
        hasRules={hasRules}
        metadata={metadata}
        rulesFired={rulesFired}
        rulesNotFired={rulesNotFired}
      >
        {cellContent}
      </ComplianceCellTooltip>

      {showDelta && (
        <span className="absolute left-full ml-1">
          <ScoreDeltaTooltip
            deltaScore={deltaScore}
            currentScore={value}
            previousMonth={
              row[COMPLIANCE_SECOND_LATEST_MONTH_KEY_MAP[columnKey]]
            }
            currentMonth={row[COMPLIANCE_LATEST_MONTH_KEY_MAP[columnKey]]}
            newFiredRules={row[COMPLIANCE_NEW_FIRED_RULES_KEY_MAP[columnKey]]}
            newNotFiredRules={
              row[COMPLIANCE_NEW_NOT_FIRED_RULES_KEY_MAP[columnKey]]
            }
          />
        </span>
      )}

      {hasRules && (
        <RulesAnalysisModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productName={productName}
          score={value}
          rulesFired={rulesFired}
          rulesNotFired={rulesNotFired}
        />
      )}
    </div>
  );
}
