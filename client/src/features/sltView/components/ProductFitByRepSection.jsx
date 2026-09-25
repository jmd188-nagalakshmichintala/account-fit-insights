import { useMemo, useState } from "react";
import { ChartHeader } from "./ChartHeader";
import { SalesRepProductChart } from "./SalesRepProductChart";
import { SalesRepProductChartSkeleton } from "./SalesRepProductChartSkeleton";
import { RepAccountsDrilldownModal } from "./RepAccountsDrilldownModal";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { useAccountDistribution } from "../hooks/useAccountDistribution";
import { useDebounce } from "@/hooks/useDebounce";

export function ProductFitByRepSection({ filters, activeTab, onTabChange }) {
  const debouncedFilters = useDebounce(filters);
  const [drilldown, setDrilldown] = useState(null); // { ownerEmail, ownerName, bucket } | null

  const handleBarClick = (rep, bucket) =>
    setDrilldown({
      ownerEmail: rep.ownerEmail,
      ownerName: rep.ownerName,
      bucket,
    });

  const {
    data: accountDistribution,
    isLoading,
    isError,
    error,
  } = useAccountDistribution(debouncedFilters);

  const chartData = useMemo(
    () => accountDistribution?.distributionData || [],
    [accountDistribution?.distributionData],
  );

  const title =
    activeTab === "potential-arr"
      ? "Potential ARR by Sales Rep"
      : "Account Fit by Sales Rep";

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <ChartHeader
        title={title}
        tabs={[
          { label: "Accounts", value: "products" },
          { label: "Potential ARR", value: "potential-arr" },
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <div className="mt-4">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          skeleton={<SalesRepProductChartSkeleton />}
          errorTitle="Failed to load product distribution"
          isEmpty={chartData.length === 0}
          emptyMessage="No product distribution data available."
        >
          <SalesRepProductChart
            data={chartData}
            mode={activeTab}
            onBarClick={handleBarClick}
          />
        </QueryBoundary>
      </div>

      <RepAccountsDrilldownModal
        key={JSON.stringify(drilldown)}
        open={drilldown != null}
        onClose={() => setDrilldown(null)}
        ownerEmail={drilldown?.ownerEmail}
        ownerName={drilldown?.ownerName}
        bucket={drilldown?.bucket}
        sltFilters={filters}
      />
    </div>
  );
}
