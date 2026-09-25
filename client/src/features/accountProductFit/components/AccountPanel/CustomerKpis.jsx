import { QueryBoundary } from "@/components/ui/QueryBoundary";
import {
  KPI_SECTIONS,
  PROSPECT_ACCOUNT_HIDDEN_KPI_SECTION_IDS,
} from "../../constants/accountProductFit.constants";
import { useKpis } from "../../hooks/useKpis";
import { KpisSkeleton } from "../../skeletons/KpisSkeleton";
import { KpiSection } from "./KpiSection";

export function CustomerKpis({ account }) {
  const { data, isLoading, isError, error } = useKpis(account?.id);

  const sections = account?.isProspectAccount
    ? KPI_SECTIONS.filter(
        (section) => !PROSPECT_ACCOUNT_HIDDEN_KPI_SECTION_IDS.has(section.id),
      )
    : KPI_SECTIONS;

  return (
    <div className="space-y-6">
      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!data || Object.keys(data).length === 0}
        skeleton={<KpisSkeleton />}
        errorTitle="Failed to load KPIs"
        emptyMessage="No KPI data found."
      >
        <div className="space-y-6">
          {sections.map((section) => (
            <KpiSection
              key={section.id}
              title={section.title}
              icon={section.icon}
              iconBg={section.iconBg}
              iconColor={section.iconColor}
              accentBorder={section.accentBorder}
              metrics={section.metrics}
              data={data}
            />
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
