import { useMemo } from "react";
import { Users, Target, DollarSign } from "lucide-react";
import { MetricCard } from "@/features/accountProductFit/components/MetricCard";
import { useAccountSummaryMetrics } from "../hooks/useAccountSummaryMetrics";
import { formatCurrencyCompact } from "@/lib/formatters";
import { useDebounce } from "@/hooks/useDebounce";

export function SummarySection({ filters = {} }) {
  const debouncedFilters = useDebounce(filters);
  const { data, isLoading, isError } =
    useAccountSummaryMetrics(debouncedFilters);

  const metrics = useMemo(() => {
    return [
      {
        label: "Total accounts",
        value: data ? data.totalAccounts : null,
        icon: Users,
      },
      {
        label: "Total accounts with open opportunities",
        value: data ? data.totalOpenOpportunities : null,
        icon: Target,
        variant: "brown",
      },
      {
        label: "Total potential ARR",
        value: data ? formatCurrencyCompact(data.totalPotentialArr) : null,
        icon: DollarSign,
        variant: "success",
      },
    ];
  }, [data]);

  return (
    <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
          variant={metric.variant}
          isLoading={isLoading}
          isError={isError}
        />
      ))}
    </div>
  );
}
