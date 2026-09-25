import { useState } from "react";
import { ChartHeader } from "./ChartHeader";
import { ScoreDistributionChart } from "./ScoreDistributionChart";
import { SalesRepProductChartSkeleton } from "./SalesRepProductChartSkeleton";
import { ScoreAccountsDrilldownModal } from "./ScoreAccountsDrilldownModal";
import { InfoBanner } from "./InfoBanner";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { useScoreDistribution } from "../hooks/useScoreDistribution";
import { useDebounce } from "@/hooks/useDebounce";
import { SCORE_DISTRIBUTION_DESCRIPTION } from "../constants/sltView.constants";

export function ProductsAcrossScoresSection({
  filters,
  showOpenOpportunity,
  onToggleOpenOpportunity,
  activeTab,
  onTabChange,
}) {
  const debouncedFilters = useDebounce(filters);
  const [drilldown, setDrilldown] = useState(null);

  const handleBarClick = (item, hasOpenOpp) =>
    setDrilldown({ score: item.score, hasOpenOpp });

  const {
    data: scoreDistribution,
    isLoading,
    isError,
    error,
  } = useScoreDistribution(debouncedFilters);

  const title =
    activeTab === "potential-arr"
      ? "Potential ARR Across Propensity Scores"
      : "Products Across Propensity Scores";

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <ChartHeader
        title={title}
        showCheckbox={true}
        checkboxLabel="Open opportunity"
        checkboxChecked={showOpenOpportunity}
        onCheckboxChange={onToggleOpenOpportunity}
        tabs={[
          { label: "Products", value: "products" },
          { label: "Potential ARR", value: "potential-arr" },
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <InfoBanner>{SCORE_DISTRIBUTION_DESCRIPTION}</InfoBanner>
      <div className="mt-4">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          skeleton={<SalesRepProductChartSkeleton />}
          errorTitle="Failed to load score distribution"
          isEmpty={
            !scoreDistribution?.scoreData ||
            scoreDistribution.scoreData.length === 0
          }
          emptyMessage="No score distribution data available."
        >
          <ScoreDistributionChart
            data={scoreDistribution?.scoreData || []}
            mode={activeTab}
            showOpenOpportunity={showOpenOpportunity}
            onBarClick={handleBarClick}
          />
        </QueryBoundary>
      </div>

      <ScoreAccountsDrilldownModal
        key={JSON.stringify(drilldown)}
        open={drilldown != null}
        onClose={() => setDrilldown(null)}
        score={drilldown?.score}
        hasOpenOpp={drilldown?.hasOpenOpp}
        sltFilters={filters}
      />
    </div>
  );
}
