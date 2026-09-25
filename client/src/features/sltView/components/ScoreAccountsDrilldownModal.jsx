import { useState } from "react";
import { AccountGroupDrilldownModal } from "./AccountGroupDrilldownModal";
import { DEFAULT_PAGINATION_SIZE } from "@/constants/pagination.constants";
import { useScoreDistributionAccounts } from "../hooks/useScoreDistributionAccounts";
import {
  SCORE_DRILLDOWN_DESCRIPTION,
  SCORE_DRILLDOWN_NOTE,
} from "../constants/sltView.constants";

function buildTitle(score, hasOpenOpp) {
  const suffix =
    hasOpenOpp === true
      ? " with open opportunities"
      : hasOpenOpp === false
        ? " without open opportunities"
        : "";
  return `Propensity score ${score} accounts${suffix}`;
}

export function ScoreAccountsDrilldownModal({
  open,
  onClose,
  score,
  hasOpenOpp,
  sltFilters,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGINATION_SIZE);

  // sltFilters may carry the "Open opportunity" checkbox's own hasOpenOpp value —
  // the clicked segment's hasOpenOpp always takes precedence over that.
  const { data, metadata, isLoading, isError, error } =
    useScoreDistributionAccounts({
      score,
      hasOpenOpp,
      filters: sltFilters,
      page,
      pageSize,
    });

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return (
    <AccountGroupDrilldownModal
      open={open}
      onClose={onClose}
      title={buildTitle(score, hasOpenOpp)}
      description={
        <>
          {SCORE_DRILLDOWN_DESCRIPTION}
          <br />
          {SCORE_DRILLDOWN_NOTE}
        </>
      }
      items={data}
      currentPage={metadata.currentPage}
      pageSize={metadata.pageSize}
      totalCount={metadata.totalCount}
      onPageChange={setPage}
      onPageSizeChange={handlePageSizeChange}
      isLoading={isLoading}
      isError={isError}
      error={error}
    />
  );
}
