import { executeQuery } from "../db/query.js";
import { TABLES } from "../config.js";
import { toSqlLiteral } from "../../shared/lib/utils/sql.js";

export function fetchContacts(accountId) {
  const sql = `
    SELECT
        sf_account_id
      , sf_account_name
      , name
      , title
      , email
      , phone
      , mailing_city
      , mailing_state
      , id
    FROM ${TABLES.customerContact}
    WHERE sf_account_id = ${toSqlLiteral(accountId)}
  `;

  return executeQuery(sql);
}

export function fetchAccountInfo(accountId) {
  const sql = `
    SELECT
        a.salesforce_account_id
      , a.cluster_id
      , a.name
      , a.city
      , a.state
      , a.operation_type
      , a.usdot_number
      , o.owner_name
      , r.ai_summary
    FROM ${TABLES.customerAccount} a
      LEFT JOIN ${TABLES.accountOwners} o
        ON a.salesforce_account_id = o.account_id
      LEFT JOIN ${TABLES.customerReporting} r
        ON a.salesforce_account_id = r.sf_account_id
    WHERE a.salesforce_account_id = ${toSqlLiteral(accountId)}
  `;

  return executeQuery(sql);
}

/** Satisfaction + firmographic + CSA score KPI columns from the account table. */
export async function fetchAccountKpis(accountId) {
  const sql = `
    SELECT
        nps_score
      , total_open_tickets
      , high_priority_tickets
      , urgent_priority_tickets
      , tickets_closed_last_12m
      , avg_resolution_time_last_12m
      , operation_type
      , industry
      , customer_fleet_size
      , iss_score
      , total_vehicles
      , last_insp_date
      , driver_fitness_score
      , hos_compliance_score
      , vehicle_maintenance_score
      , driver_fitness_percentile
      , hos_compliance_percentile
      , vehicle_maintenance_percentile
      , unsafe_driving_score
      , unsafe_driving_percentile
    FROM ${TABLES.customerAccount}
    WHERE salesforce_account_id = ${toSqlLiteral(accountId)}
  `;

  return await executeQuery(sql);
}

/** Products whose ARR / YoY-growth split-ups are exposed as additionalData. */
const ARR_SPLIT_PRODUCTS =
  "('Compliance - Asset', 'Compliance - Driver', 'Safety+')";

/** Collapse `[{ product, <valueColumn> }]` rows into a `{ product: value }` map. */
function keyByProduct(rows, valueColumn) {
  return rows.reduce((acc, row) => {
    acc[row.product] = row[valueColumn];
    return acc;
  }, {});
}

/**
 * Aggregated current ARR and year-over-year growth for the account.
 *
 * Returns the account-level totals (`main`) alongside the per-product split-ups
 * (`additionalData`) so the service can surface the split uniformly.
 */
export async function fetchArrKpis(accountId) {
  const id = toSqlLiteral(accountId);

  const accountCurrentArr = `
    SELECT SUM(current_arr) AS current_arr
    FROM ${TABLES.customerProductArr}
    WHERE sf_account_id = ${id}
  `;

  const productCurrentArr = `
    SELECT
        product
      , SUM(current_arr) AS current_arr
    FROM ${TABLES.customerProductArr}
    WHERE sf_account_id = ${id} AND product IN ${ARR_SPLIT_PRODUCTS}
    GROUP BY product
  `;

  const accountYoyGrowth = `
    SELECT
      yoy_arr_growth
      , yoy_arr_growth_pct
    FROM ${TABLES.yoyArrGrowth}
    WHERE sf_account_id = ${id}
  `;

  const [accountCurrentRows, productCurrentRows, accountYoyRows] =
    await Promise.all([
      executeQuery(accountCurrentArr),
      executeQuery(productCurrentArr),
      executeQuery(accountYoyGrowth),
    ]);

  return {
    currentArr: {
      main: accountCurrentRows[0]?.current_arr ?? null,
      additionalData: keyByProduct(productCurrentRows, "current_arr"),
    },
    yearOverYearGrowthPct: {
      main: accountYoyRows[0]?.yoy_arr_growth_pct ?? null,
    },
    yearOverYearGrowthDiff: {
      main: accountYoyRows[0]?.yoy_arr_growth ?? null,
    },
  };
}

/** Total inspection violations for the account. */
export async function fetchViolationKpis(accountId) {
  const totalInspViolSql = `
    SELECT
      total_viol,
      DRIVER_VIOL_TOTAL,
      HAZMAT_VIOL_TOTAL,
      VEHICLE_VIOL_TOTAL
    FROM ${TABLES.customerViolations}
    WHERE sf_account_id = ${toSqlLiteral(accountId)}
  `;

  const result = await executeQuery(totalInspViolSql);

  return {
    totalViolations: {
      main: result[0]?.total_viol ?? null,
      additionalData: {
        totalDriverViolations: result[0]?.DRIVER_VIOL_TOTAL ?? null,
        totalHazmatViolations: result[0]?.HAZMAT_VIOL_TOTAL ?? null,
        totalVehicleViolations: result[0]?.VEHICLE_VIOL_TOTAL ?? null,
      },
    },
  };
}

/** Fetch engagement opportunities for the account. */
export function fetchEngagement(accountId) {
  const sql = `
    SELECT
        products
      , opportunity_name
      , stage_name
      , is_closed
      , is_won
      , opp_closed_date
      , gong_associated_opportunities_c
    FROM ${TABLES.customerOpps}
    WHERE sf_account_id = ${toSqlLiteral(accountId)}
    ORDER BY is_closed ASC, opp_closed_date DESC
  `;

  return executeQuery(sql);
}
