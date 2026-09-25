import { ProductMetadataTooltip } from "./ProductMetadataTooltip";
import { RulesFiredTooltip } from "./RulesFiredTooltip";
import { RulesNotFiredTooltip } from "./RulesNotFiredTooltip";

/** Wraps the cell content in whichever tooltip applies for this cell's state. */
export function ComplianceCellTooltip({
  isOwned,
  isLowScore,
  hasRules,
  metadata,
  rulesFired,
  rulesNotFired,
  children,
}) {
  if (isOwned) {
    return (
      <ProductMetadataTooltip metadata={metadata}>
        {children}
      </ProductMetadataTooltip>
    );
  }

  if (isLowScore) {
    return (
      <RulesNotFiredTooltip rulesNotFired={rulesNotFired}>
        {children}
      </RulesNotFiredTooltip>
    );
  }

  if (hasRules) {
    return (
      <RulesFiredTooltip rulesFired={rulesFired}>{children}</RulesFiredTooltip>
    );
  }

  return children;
}
