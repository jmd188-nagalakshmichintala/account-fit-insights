import { useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { LabeledDropdown } from "@/components/ui/LabeledDropdown";
import { AccountOwnerFilter } from "./AccountOwnerFilter";
import { FleetSizeRangeFilter } from "./FleetSizeRangeFilter";
import { ComplianceScoreFilters } from "./ComplianceScoreFilters";
import { Top100Filter } from "./Top100Filter";
import { OpenOpportunitiesFilter } from "./OpenOpportunitiesFilter";
import { ProspectAccountsFilter } from "./ProspectAccountsFilter";
import { ExistingAccountsFilter } from "./ExistingAccountsFilter";
import { OPERATION_TYPE_OPTIONS } from "../constants/accountProductFit.constants";
import { useFilters } from "../context/FilterContext";
import { useMaxFleetSize } from "../hooks/useMaxFleetSize";
import { useActiveFilterCount } from "../hooks/useActiveFilterCount";

export function AdvancedFiltersAccordion({
  ownerOptions,
  canFilterByOwner = true,
  defaultOpen = false,
}) {
  const filters = useFilters();
  const { data: maxFleetSize = 10000 } = useMaxFleetSize();
  const activeCount = useActiveFilterCount(maxFleetSize);
  const hasActiveFilters = activeCount > 0;

  useEffect(() => {
    if (maxFleetSize && filters.fleetSizeMax !== maxFleetSize) {
      filters.setFleetSizeMax(maxFleetSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxFleetSize]);

  return (
    <Accordion className="mb-4">
      <AccordionItem value="advanced-filters" defaultOpen={defaultOpen}>
        <AccordionTrigger icon={SlidersHorizontal}>
          <div className="flex items-center gap-2">
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-400 text-xs font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-4">
            <div
              className={`grid grid-cols-1 gap-4 ${canFilterByOwner ? "md:grid-cols-3" : "md:grid-cols-2"}`}
            >
              {canFilterByOwner && (
                <AccountOwnerFilter
                  options={ownerOptions}
                  selectedIds={filters.selectedOwnerIds}
                  onChange={filters.handleOwnerChange}
                />
              )}
              <LabeledDropdown
                label="Fleet Type"
                options={OPERATION_TYPE_OPTIONS}
                value={filters.operationType || ""}
                onChange={filters.handleOperationTypeChange}
                placeholder="All fleet types"
                className="w-56"
              />
              <FleetSizeRangeFilter
                min={0}
                max={maxFleetSize}
                value={filters.fleetSizeRange}
                onChange={filters.setFleetSizeRange}
                label="Fleet Size"
              />
            </div>

            <ComplianceScoreFilters />

            <div className="flex items-center gap-3">
              <Top100Filter
                value={filters.top100Only}
                onChange={filters.setTop100Only}
              />
              <ProspectAccountsFilter
                value={filters.prospectAccountsOnly}
                onChange={filters.setProspectAccountsOnly}
              />
              <ExistingAccountsFilter
                value={filters.existingAccountsOnly}
                onChange={filters.setExistingAccountsOnly}
              />
              <OpenOpportunitiesFilter
                value={filters.openOppsFilter}
                onChange={filters.handleOpenOppsChange}
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => filters.handleClearAllFilters(maxFleetSize)}
                  className="ml-auto rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
