import { useState } from "react";
import { AccountGroupDrilldownModal } from "./AccountGroupDrilldownModal";
import { DEFAULT_PAGINATION_SIZE } from "@/constants/pagination.constants";
import { useAccountDistributionAccounts } from "../hooks/useAccountDistributionAccounts";
import { SCORE_RANGE_LABELS } from "../constants/sltView.constants";

export function RepAccountsDrilldownModal({
  open,
  onClose,
  ownerEmail,
  ownerName,
  bucket,
  sltFilters,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGINATION_SIZE);

  const { data, metadata, isLoading, isError, error } =
    useAccountDistributionAccounts({
      ownerEmail,
      bucket,
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
      title={`${ownerName} — ${SCORE_RANGE_LABELS[bucket] ?? ""} accounts`}
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
