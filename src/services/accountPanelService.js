import {
  fetchContacts,
  fetchAccountInfo,
  fetchAccountKpis,
  fetchArrKpis,
  fetchViolationKpis,
  fetchEngagement,
} from "../repositories/accountPanelRepository.js";

export async function getContactsForAccount(accountId) {
  return await fetchContacts(accountId);
}

export async function getAccountInfoForAccount(accountId) {
  return await fetchAccountInfo(accountId);
}

/**
 * Convert ISS score to bandwidth label.
 */
function getIssScoreBandwidth(score) {
  if (score == null || score === "") return null;
  const numScore = Number(score);
  if (isNaN(numScore)) return null;
  if (numScore >= 1 && numScore <= 49) return "Low";
  if (numScore >= 50 && numScore <= 74) return "Average";
  if (numScore >= 75 && numScore <= 100) return "High";
  return null;
}

/** Build a single KPI metric entry in the shape the frontend expects. */
function kpiMetric(metricKey, mainData, additionalData = {}) {
  return { metricKey, mainData: mainData ?? null, additionalData };
}

/**
 * Assemble the KPI panel payload for an account, grouped by section.
 * Runs the independent source queries in parallel.
 */
export async function getKpisForAccount(accountId) {
  const [accountRows, arr, violation] = await Promise.all([
    fetchAccountKpis(accountId),
    fetchArrKpis(accountId),
    fetchViolationKpis(accountId),
  ]);

  const account = accountRows[0] ?? {};

  return {
    data: {
      customerSatisfaction: [
        kpiMetric("npsScore", account.nps_score),
        kpiMetric("totalOpenTickets", account.total_open_tickets, {
          highPriorityTickets: account.high_priority_tickets ?? null,
          urgentPriorityTickets: account.urgent_priority_tickets ?? null,
        }),
        kpiMetric(
          "avgResolutionTimeLast12m",
          account.avg_resolution_time_last_12m,
        ),
        kpiMetric("ticketsClosedLast12m", account.tickets_closed_last_12m),
      ],
      financials: [
        kpiMetric(
          "currentArr",
          arr.currentArr.main,
          arr.currentArr.additionalData,
        ),
        kpiMetric("yearOverYearGrowthPct", arr.yearOverYearGrowthPct.main),
        kpiMetric("yearOverYearGrowthDiff", arr.yearOverYearGrowthDiff.main),
      ],
      firmographic: [
        kpiMetric("operationType", account.operation_type),
        kpiMetric("endIndustryCoarse", account.industry),
        kpiMetric("customerFleetSize", account.customer_fleet_size),
        kpiMetric("issScore", getIssScoreBandwidth(account.iss_score)),
        kpiMetric("vehicleCount", account.total_vehicles),
      ],
      regulatoryCompliance: [
        kpiMetric(
          "totalViolations",
          violation.totalViolations.main,
          violation.totalViolations.additionalData,
        ),
        kpiMetric("lastInspectionDate", account.last_insp_date),
      ],
      csaScores: [
        kpiMetric("driverFitnessScore", {
          score: account.driver_fitness_score ?? null,
          percentile: account.driver_fitness_percentile ?? null,
        }),
        kpiMetric("hosComplianceScore", {
          score: account.hos_compliance_score ?? null,
          percentile: account.hos_compliance_percentile ?? null,
        }),
        kpiMetric("vehicleMaintenanceScore", {
          score: account.vehicle_maintenance_score ?? null,
          percentile: account.vehicle_maintenance_percentile ?? null,
        }),
        kpiMetric("unsafeDrivingScore", {
          score: account.unsafe_driving_score ?? null,
          percentile: account.unsafe_driving_percentile ?? null,
        }),
      ],
    },
  };
}

export async function getEngagementForAccount(accountId) {
  return await fetchEngagement(accountId);
}
