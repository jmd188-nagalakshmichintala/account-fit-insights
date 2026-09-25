import { useMemo } from "react";
import { useFilters } from "../context/FilterContext";

export function useActiveFilterCount(maxFleetSize) {
  const filters = useFilters();

  return useMemo(
    () =>
      [
        filters.selectedOwnerIds && filters.selectedOwnerIds.length > 0,
        filters.operationType && filters.operationType.length > 0,
        filters.complianceAssetRange[0] !== 0 ||
          filters.complianceAssetRange[1] !== 10,
        filters.complianceDriverRange[0] !== 0 ||
          filters.complianceDriverRange[1] !== 10,
        filters.safetyRange[0] !== 0 || filters.safetyRange[1] !== 10,
        filters.fleetSizeRange[0] !== 0 ||
          filters.fleetSizeRange[1] !== maxFleetSize,
        filters.top100Only,
        filters.prospectAccountsOnly,
        filters.existingAccountsOnly,
        filters.openOppsFilter,
        filters.complianceAssetTrend,
        filters.complianceDriverTrend,
        filters.safetyTrend,
      ].filter(Boolean).length,
    [
      filters.selectedOwnerIds,
      filters.operationType,
      filters.complianceAssetRange,
      filters.complianceDriverRange,
      filters.safetyRange,
      filters.fleetSizeRange,
      filters.top100Only,
      filters.prospectAccountsOnly,
      filters.existingAccountsOnly,
      filters.openOppsFilter,
      filters.complianceAssetTrend,
      filters.complianceDriverTrend,
      filters.safetyTrend,
      maxFleetSize,
    ],
  );
}
