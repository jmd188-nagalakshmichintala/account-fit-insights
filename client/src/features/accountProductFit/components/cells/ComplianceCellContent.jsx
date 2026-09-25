import {
  PRODUCT_FIT_VALUES,
  REVENUE_COLUMNS,
} from "../../constants/accountProductFit.constants";
import { OwnershipBadge } from "./OwnershipBadge";
import { SafetyCell } from "./SafetyCell";

export function ComplianceCellContent({
  value,
  columnKey,
  onClick,
  onKeyDown,
  hasRules,
  productName,
}) {
  const isOwned = value === PRODUCT_FIT_VALUES.Owned;

  return (
    <div
      className={hasRules ? "cursor-pointer" : ""}
      onClick={onClick}
      role={hasRules ? "button" : undefined}
      tabIndex={hasRules ? 0 : undefined}
      onKeyDown={onKeyDown}
      aria-label={hasRules ? `View ${productName} rules analysis` : undefined}
    >
      {isOwned ? (
        <OwnershipBadge showRevenueText={REVENUE_COLUMNS.has(columnKey)} />
      ) : (
        <SafetyCell value={Number(value)} />
      )}
    </div>
  );
}
