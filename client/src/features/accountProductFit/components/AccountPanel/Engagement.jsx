import { useMemo } from "react";
import { Handshake } from "lucide-react";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { useEngagement } from "../../hooks/useEngagement";
import { EngagementSkeleton } from "../../skeletons/EngagementSkeleton";
import { ENGAGEMENT_BADGE_STYLES } from "../../constants/accountProductFit.constants";
import { OpportunityCard } from "./OpportunityCard";

function SectionHeader({ label, count }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Handshake className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </h3>
      </div>
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export function Engagement({ account }) {
  const {
    data: opportunities = [],
    isLoading,
    isError,
    error,
  } = useEngagement(account?.id);

  const { previousOpps, openOpps } = useMemo(() => {
    const previous = opportunities.filter((opp) => opp.is_closed === true);
    const open = opportunities.filter((opp) => opp.is_closed !== true);
    return { previousOpps: previous, openOpps: open };
  }, [opportunities]);

  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      skeleton={<EngagementSkeleton />}
      errorTitle="Failed to load engagement data"
    >
      {opportunities.length === 0 ? (
        <StatusMessage
          variant="empty"
          icon={<Handshake className="h-5 w-5 shrink-0" />}
          message="No engagement opportunities found for this account."
        />
      ) : (
        <div className="space-y-6">
          {openOpps.length > 0 && (
            <div>
              <SectionHeader label="Open Pipeline" count={openOpps.length} />
              <div>
                {openOpps.map((opp, idx) => (
                  <OpportunityCard
                    key={idx}
                    opp={opp}
                    isLast={idx === openOpps.length - 1}
                    dotColor="bg-amber-500"
                    badgeStyle={ENGAGEMENT_BADGE_STYLES.open}
                    badgeText={opp.stage_name || "—"}
                  />
                ))}
              </div>
            </div>
          )}

          {previousOpps.length > 0 && (
            <div>
              <SectionHeader
                label="Previous Opportunities"
                count={previousOpps.length}
              />
              <div>
                {previousOpps.map((opp, idx) => (
                  <OpportunityCard
                    key={idx}
                    opp={opp}
                    isLast={idx === previousOpps.length - 1}
                    dotColor={opp.is_won ? "bg-emerald-500" : "bg-red-500"}
                    badgeStyle={
                      opp.is_won
                        ? ENGAGEMENT_BADGE_STYLES.closedWon
                        : ENGAGEMENT_BADGE_STYLES.closedLost
                    }
                    badgeText={opp.is_won ? "Closed Won" : "Closed Lost"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </QueryBoundary>
  );
}
