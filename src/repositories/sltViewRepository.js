import { executeQuery } from "../db/query.js";
import { TABLES } from "../config.js";
import { toSqlLiteral } from "../../shared/lib/utils/sql.js";
import { getProductColumn } from "../utils/productMapping.js";
import { buildSortExpression } from "./customerRepository.js";

/**
 * Resolves an account's owner-of-record for filtering: a real child account
 * (has_parent = true) rolls up to its ultimate parent's owner, everything
 * else (top-level and orphan accounts) is owned by itself. Mirrors the
 * rollup customerRepository.js applies for the grouped account-fit view.
 * Requires `wcr` (TABLES.customerReporting) to be joined into the query.
 */
const EFFECTIVE_OWNER_ACCOUNT_EXPR =
  "CASE WHEN wcr.has_parent = true THEN wcr.ultimate_parent_id_c ELSE wcr.sf_account_id END";

// Top-level (parent) accounts only — same scope customerRepository.js's grouped
// view uses (buildTopAccountScopeCondition), so the "Account Fit by Sales Rep"
// bar counts and its drilldown only count parents, matching the first tab's table.
const TOP_ACCOUNT_SCOPE_CONDITION =
  "(wcr.sf_account_id = wcr.ultimate_parent_id_c OR wcr.has_parent = false)";

function buildSltViewWhereConditions(ownerEmails, filters = {}) {
  const ownerEmailList = ownerEmails.map(toSqlLiteral).join(", ");

  const conditions = [
    `ao.owner_email IN (${ownerEmailList})`,
    `apr.product_score IS NOT NULL`,
  ];

  if (filters.segment) {
    conditions.push(`apr.fleet_segment = ${toSqlLiteral(filters.segment)}`);
  }

  if (filters.salesRep) {
    conditions.push(`ao.owner_email = ${toSqlLiteral(filters.salesRep)}`);
  }

  if (filters.region) {
    conditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  if (filters.product) {
    conditions.push(`apr.product = ${toSqlLiteral(filters.product)}`);
  }

  return {
    conditions,
    needsRegionJoin: !!filters.region,
  };
}

export async function fetchProductDistributionBySalesRep(
  ownerEmails,
  filters = {},
) {
  if (!ownerEmails || ownerEmails.length === 0) {
    return [];
  }

  const { conditions, needsRegionJoin } = buildSltViewWhereConditions(
    ownerEmails,
    filters,
  );
  const whereClause = conditions.join(" AND ");

  const sql = `
    SELECT
        ao.owner_email
      , ao.owner_name
      , CASE
          WHEN apr.product_score >= 8 THEN 'High'
          WHEN apr.product_score >= 4 THEN 'Mid'
          ELSE 'Low'
        END as score_range
      , apr.product_score
      , COUNT(*) as product_count
      , SUM(apr.product_potential_arr) as total_potential_arr
    FROM ${TABLES.accountProductReporting} apr
    INNER JOIN ${TABLES.customerReporting} wcr
      ON apr.sf_account_id = wcr.sf_account_id
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    ${needsRegionJoin ? `LEFT JOIN ${TABLES.customerAccount} ca ON ca.salesforce_account_id = apr.sf_account_id` : ""}
    WHERE ${whereClause}
    GROUP BY
        ao.owner_email
      , ao.owner_name
      , score_range
      , apr.product_score
    ORDER BY ao.owner_name, apr.product_score
  `;

  return executeQuery(sql);
}

export async function fetchProductDistributionByScore(
  ownerEmails,
  filters = {},
) {
  if (!ownerEmails || ownerEmails.length === 0) {
    return [];
  }

  const { conditions, needsRegionJoin } = buildSltViewWhereConditions(
    ownerEmails,
    filters,
  );
  const whereClause = conditions.join(" AND ");

  const sql = `
    SELECT
        apr.product_score
      , COUNT(*) as product_count
      , SUM(apr.product_potential_arr) as total_potential_arr
      , SUM(CASE WHEN apr.has_open_opps = true THEN 1 ELSE 0 END) as open_product_count
      , SUM(CASE WHEN apr.has_open_opps = true THEN apr.product_potential_arr ELSE 0 END) as open_potential_arr
    FROM ${TABLES.accountProductReporting} apr
    INNER JOIN ${TABLES.customerReporting} wcr
      ON apr.sf_account_id = wcr.sf_account_id
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    ${needsRegionJoin ? `LEFT JOIN ${TABLES.customerAccount} ca ON ca.salesforce_account_id = apr.sf_account_id` : ""}
    WHERE ${whereClause}
    GROUP BY apr.product_score
    ORDER BY apr.product_score
  `;

  return executeQuery(sql);
}

/**
 * Top-level (parent) accounts behind one score bar of the "Products Across
 * Propensity Scores" chart (see {@link fetchProductDistributionByScore}) —
 * an account qualifies when it has at least one accountProductReporting row
 * at that exact score (matching `filters.product` when set, and
 * `hasOpenOpp` when set), so a click on a bar (or one of its open/non-open
 * segments) is guaranteed to match the rows returned here. Distinct
 * accounts, not distinct product rows: an account with two products both at
 * this score still appears once, with both scores visible in its own row.
 */
export async function fetchAccountsForScoreBucket(
  ownerEmails,
  filters = {},
  score,
  hasOpenOpp,
  { limit, offset } = {},
) {
  if (!ownerEmails || ownerEmails.length === 0) {
    return { rows: [], totalCount: 0 };
  }

  const ownerEmailList = ownerEmails.map(toSqlLiteral).join(", ");

  const whereConditions = [
    `ao.owner_email IN (${ownerEmailList})`,
    TOP_ACCOUNT_SCOPE_CONDITION,
  ];

  if (filters.salesRep) {
    whereConditions.push(`ao.owner_email = ${toSqlLiteral(filters.salesRep)}`);
  }

  if (filters.region) {
    whereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  const productRowConditions = [
    `apr.sf_account_id = wcr.sf_account_id`,
    `apr.product_score = ${toSqlLiteral(Number(score))}`,
  ];

  if (filters.segment) {
    productRowConditions.push(
      `apr.fleet_segment = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.product) {
    productRowConditions.push(`apr.product = ${toSqlLiteral(filters.product)}`);
  }

  if (hasOpenOpp != null) {
    productRowConditions.push(
      `apr.has_open_opps = ${hasOpenOpp ? "true" : "false"}`,
    );
  }

  whereConditions.push(
    `EXISTS (SELECT 1 FROM ${TABLES.accountProductReporting} apr WHERE ${productRowConditions.join(" AND ")})`,
  );

  const whereClause = whereConditions.join(" AND ");

  const fromClause = `
    FROM ${TABLES.customerReporting} wcr
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    LEFT JOIN ${TABLES.customerAccount} ca
      ON ca.salesforce_account_id = wcr.sf_account_id
  `;

  const dataSql = `
    SELECT
        wcr.*
      , ca.operation_type
      , ca.is_top_100 AS account_is_top_100
      , EXISTS (
          SELECT 1
          FROM ${TABLES.customerOpps} opps
          WHERE opps.sf_account_id = wcr.sf_account_id
            AND opps.is_closed = false
        ) AS has_open_opps
    ${fromClause}
    WHERE ${whereClause}
    ORDER BY
      ${buildSortExpression("potential_arr", "wcr.potential_arr")} DESC,
      wcr.sf_account_id ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countSql = `
    SELECT COUNT(*) as total_count
    ${fromClause}
    WHERE ${whereClause}
  `;

  const [rows, countRows] = await Promise.all([
    executeQuery(dataSql),
    executeQuery(countSql),
  ]);

  return { rows, totalCount: countRows[0]?.total_count ?? 0 };
}

export async function fetchSummaryMetrics(ownerEmails, filters = {}) {
  if (!ownerEmails || ownerEmails.length === 0) {
    return {
      totalProducts: 0,
      totalOpenOpportunities: 0,
      totalPotentialArr: 0,
    };
  }

  const ownerEmailList = ownerEmails.map(toSqlLiteral).join(", ");

  let oppsWhereConditions = [
    `ao.owner_email IN (${ownerEmailList})`,
    `co.has_open_opps = true`,
  ];

  if (filters.segment) {
    oppsWhereConditions.push(
      `ca.customer_fleet_size = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.salesRep) {
    oppsWhereConditions.push(
      `ao.owner_email = ${toSqlLiteral(filters.salesRep)}`,
    );
  }

  if (filters.region) {
    oppsWhereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  if (filters.product) {
    oppsWhereConditions.push(`co.product = ${toSqlLiteral(filters.product)}`);
  }

  const oppsWhereClause = oppsWhereConditions.join(" AND ");
  const needsAccountJoinForOpps = !!(filters.segment || filters.region);

  const totalOpenOpportunitiesSql = `
    SELECT COUNT(co.product_score) as total_open_opportunities
    FROM ${TABLES.accountProductReporting} co
    -- pulls in has_parent/ultimate_parent_id_c so ao can roll child accounts up to their parent's owner
    INNER JOIN ${TABLES.customerReporting} wcr
      ON co.sf_account_id = wcr.sf_account_id
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    ${needsAccountJoinForOpps ? `LEFT JOIN ${TABLES.customerAccount} ca ON ca.salesforce_account_id = co.sf_account_id` : ""}
    WHERE ${oppsWhereClause}
  `;

  let arrWhereConditions = [`ao.owner_email IN (${ownerEmailList})`];

  if (filters.segment) {
    arrWhereConditions.push(
      `apr.fleet_segment = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.salesRep) {
    arrWhereConditions.push(
      `ao.owner_email = ${toSqlLiteral(filters.salesRep)}`,
    );
  }

  if (filters.region) {
    arrWhereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  if (filters.product) {
    arrWhereConditions.push(`apr.product = ${toSqlLiteral(filters.product)}`);
  }

  const arrWhereClause = arrWhereConditions.join(" AND ");
  const needsRegionJoinForArr = !!filters.region;

  const totalPotentialArrSql = `
    SELECT SUM(apr.product_potential_arr) as total_potential_arr
    FROM ${TABLES.accountProductReporting} apr
    -- pulls in has_parent/ultimate_parent_id_c so ao can roll child accounts up to their parent's owner
    INNER JOIN ${TABLES.customerReporting} wcr
      ON apr.sf_account_id = wcr.sf_account_id
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    ${needsRegionJoinForArr ? `LEFT JOIN ${TABLES.customerAccount} ca ON ca.salesforce_account_id = apr.sf_account_id` : ""}
    WHERE ${arrWhereClause}
  `;

  let productsWhereConditions = [
    `ao.owner_email IN (${ownerEmailList})`,
    `apr.product_score IS NOT NULL`,
  ];

  if (filters.segment) {
    productsWhereConditions.push(
      `apr.fleet_segment = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.salesRep) {
    productsWhereConditions.push(
      `ao.owner_email = ${toSqlLiteral(filters.salesRep)}`,
    );
  }

  if (filters.region) {
    productsWhereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  if (filters.product) {
    productsWhereConditions.push(
      `apr.product = ${toSqlLiteral(filters.product)}`,
    );
  }

  const productsWhereClause = productsWhereConditions.join(" AND ");
  const needsRegionJoinForProducts = !!filters.region;

  const totalProductsSql = `
    SELECT COUNT(apr.product_score) as total_products
    FROM ${TABLES.accountProductReporting} apr
    -- pulls in has_parent/ultimate_parent_id_c so ao can roll child accounts up to their parent's owner
    INNER JOIN ${TABLES.customerReporting} wcr
      ON apr.sf_account_id = wcr.sf_account_id
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    ${needsRegionJoinForProducts ? `LEFT JOIN ${TABLES.customerAccount} ca ON ca.salesforce_account_id = apr.sf_account_id` : ""}
    WHERE ${productsWhereClause}
  `;

  const [oppsResult, arrResult, productsResult] = await Promise.all([
    executeQuery(totalOpenOpportunitiesSql),
    executeQuery(totalPotentialArrSql),
    executeQuery(totalProductsSql),
  ]);

  return {
    totalProducts: productsResult[0]?.total_products ?? 0,
    totalOpenOpportunities: oppsResult[0]?.total_open_opportunities ?? 0,
    totalPotentialArr: arrResult[0]?.total_potential_arr ?? 0,
  };
}

const FIT_BUCKET_LABELS = { high: "High", mid: "Medium", low: "Low" };

/**
 * Top-level (parent) accounts behind one segment of the "Account Fit by Sales
 * Rep" chart bar (see {@link fetchAccountDistributionBySalesRep}) — same
 * owner-rollup/segment/region/product/top-account scoping, plus a bucket
 * condition, so a click on a bar's count is guaranteed to match the rows
 * returned here. The service layer fetches each row's real children
 * separately (see {@link fetchChildAccountsForTopAccounts} in
 * customerRepository.js) to build the parent/child hierarchy the drilldown
 * modal shows, mirroring the first tab's grouped table.
 */
export async function fetchAccountsForFitBucket(
  ownerEmails,
  filters = {},
  bucket,
  { limit, offset } = {},
) {
  if (!ownerEmails || ownerEmails.length === 0) {
    return { rows: [], totalCount: 0 };
  }

  const ownerEmailList = ownerEmails.map(toSqlLiteral).join(", ");
  const productFilter = filters.product;
  const productColumn = productFilter ? getProductColumn(productFilter) : null;

  const whereConditions = [
    `ao.owner_email IN (${ownerEmailList})`,
    TOP_ACCOUNT_SCOPE_CONDITION,
  ];

  if (filters.segment) {
    whereConditions.push(
      `ca.customer_fleet_size = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.salesRep) {
    whereConditions.push(`ao.owner_email = ${toSqlLiteral(filters.salesRep)}`);
  }

  if (filters.region) {
    whereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  if (productColumn) {
    const scoreExpr = `TRY_CAST(wcr.${productColumn} AS INT)`;
    const bucketCondition =
      bucket === "high"
        ? `${scoreExpr} >= 8`
        : bucket === "mid"
          ? `${scoreExpr} BETWEEN 4 AND 7`
          : `${scoreExpr} BETWEEN 0 AND 3`;
    whereConditions.push(`wcr.${productColumn} IS NOT NULL`, bucketCondition);
  } else {
    whereConditions.push(
      `wcr.account_fit = ${toSqlLiteral(FIT_BUCKET_LABELS[bucket])}`,
    );
  }

  const whereClause = whereConditions.join(" AND ");

  const fromClause = `
    FROM ${TABLES.customerReporting} wcr
    INNER JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
    LEFT JOIN ${TABLES.customerAccount} ca
      ON ca.salesforce_account_id = wcr.sf_account_id
  `;

  const dataSql = `
    SELECT
        wcr.*
      , ca.operation_type
      , ca.is_top_100 AS account_is_top_100
      , EXISTS (
          SELECT 1
          FROM ${TABLES.customerOpps} opps
          WHERE opps.sf_account_id = wcr.sf_account_id
            AND opps.is_closed = false
        ) AS has_open_opps
    ${fromClause}
    WHERE ${whereClause}
    ORDER BY
      ${buildSortExpression("potential_arr", "wcr.potential_arr")} DESC,
      wcr.sf_account_id ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countSql = `
    SELECT COUNT(*) as total_count
    ${fromClause}
    WHERE ${whereClause}
  `;

  const [rows, countRows] = await Promise.all([
    executeQuery(dataSql),
    executeQuery(countSql),
  ]);

  return { rows, totalCount: countRows[0]?.total_count ?? 0 };
}

export async function fetchAccountDistributionBySalesRep(
  ownerEmails,
  filters = {},
) {
  if (!ownerEmails || ownerEmails.length === 0) {
    return [];
  }

  const ownerEmailList = ownerEmails.map(toSqlLiteral).join(", ");
  const productFilter = filters.product;
  const productColumn = productFilter ? getProductColumn(productFilter) : null;
  const productArrField = productFilter
    ? getProductColumn(productFilter)
    : null;

  let whereConditions = [
    `ao.owner_email IN (${ownerEmailList})`,
    TOP_ACCOUNT_SCOPE_CONDITION,
  ];

  if (filters.segment) {
    whereConditions.push(
      `ca.customer_fleet_size = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.salesRep) {
    whereConditions.push(`ao.owner_email = ${toSqlLiteral(filters.salesRep)}`);
  }

  if (filters.region) {
    whereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  const whereClause = whereConditions.join(" AND ");

  let sql;

  if (productColumn) {
    sql = `
      SELECT
          ao.owner_email
        , ao.owner_name
        , CASE
            WHEN wcr.${productColumn} = 'Owned' THEN 'Owned'
            WHEN TRY_CAST(wcr.${productColumn} AS INT) >= 8 THEN 'High'
            WHEN TRY_CAST(wcr.${productColumn} AS INT) >= 4 THEN 'Mid'
            ELSE 'Low'
          END as score_range
        , wcr.${productColumn} as actual_score
        , COUNT(DISTINCT wcr.sf_account_id) as account_count
        , SUM(wcr.potential_arr_${productArrField}) as total_arr
      FROM ${TABLES.customerReporting} wcr
      -- rolls child accounts up to their parent's owner
      INNER JOIN ${TABLES.accountOwners} ao
        ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
      LEFT JOIN ${TABLES.customerAccount} ca
        ON wcr.sf_account_id = ca.salesforce_account_id
      WHERE ${whereClause}
        AND wcr.${productColumn} IS NOT NULL
      GROUP BY ao.owner_email, ao.owner_name, score_range, wcr.${productColumn}
      ORDER BY ao.owner_name, wcr.${productColumn} DESC
    `;
  } else {
    sql = `
      WITH scored_accounts AS (
        SELECT
            wcr.sf_account_id
          , ao.owner_email
          , ao.owner_name
          , GREATEST(
              CASE WHEN wcr.compliance_driver != 'Owned' THEN COALESCE(TRY_CAST(wcr.compliance_driver AS INT), 0) ELSE 0 END,
              CASE WHEN wcr.compliance_asset != 'Owned' THEN COALESCE(TRY_CAST(wcr.compliance_asset AS INT), 0) ELSE 0 END,
              CASE WHEN wcr.safety != 'Owned' THEN COALESCE(TRY_CAST(wcr.safety AS INT), 0) ELSE 0 END
            ) as max_score
          , wcr.potential_arr
        FROM ${TABLES.customerReporting} wcr
        -- rolls child accounts up to their parent's owner
        INNER JOIN ${TABLES.accountOwners} ao
          ON ao.account_id = ${EFFECTIVE_OWNER_ACCOUNT_EXPR}
        LEFT JOIN ${TABLES.customerAccount} ca
          ON wcr.sf_account_id = ca.salesforce_account_id
        WHERE ${whereClause}
      )
      SELECT
          owner_email
        , owner_name
        , CASE
            WHEN max_score >= 8 THEN 'High'
            WHEN max_score >= 4 THEN 'Mid'
            ELSE 'Low'
          END as score_range
        , max_score as actual_score
        , COUNT(DISTINCT sf_account_id) as account_count
        , SUM(potential_arr) as total_arr
      FROM scored_accounts
      GROUP BY owner_email, owner_name, score_range, max_score
      ORDER BY owner_name, max_score DESC
    `;
  }

  return executeQuery(sql);
}

// Same account-universe rule fetchProductFitSummary (customerRepository.js) uses:
// null means unrestricted (full access), an empty list means no access at all.
function buildAllowedAccountsCondition(allowedAccountIds) {
  if (allowedAccountIds === null) return null;
  if (!allowedAccountIds.length) return "FALSE";

  const idList = allowedAccountIds.map(toSqlLiteral).join(", ");
  return `wcr.sf_account_id IN (${idList})`;
}

export async function fetchAccountSummaryMetrics(filters = {}) {
  const productFilter = filters.product;
  const productColumn = productFilter ? getProductColumn(productFilter) : null;

  const whereConditions = [
    buildAllowedAccountsCondition(filters.allowedAccountIds),
    "wcr.is_deprioritized = false",
  ].filter(Boolean);

  if (filters.segment) {
    whereConditions.push(
      `ca.customer_fleet_size = ${toSqlLiteral(filters.segment)}`,
    );
  }

  if (filters.salesRep) {
    whereConditions.push(`ao.owner_email = ${toSqlLiteral(filters.salesRep)}`);
  }

  if (filters.region) {
    whereConditions.push(`ca.region = ${toSqlLiteral(filters.region)}`);
  }

  if (productColumn) {
    whereConditions.push(`wcr.${productColumn} IS NOT NULL`);
  }

  const whereClause = whereConditions.join(" AND ");

  const arrColumn = productColumn
    ? `wcr.potential_arr_${productColumn}`
    : `wcr.potential_arr`;
  const accountsAndArrSql = `
    SELECT
        COUNT(DISTINCT wcr.sf_account_id) as total_accounts
      , SUM(${arrColumn}) as total_potential_arr
    FROM ${TABLES.customerReporting} wcr
    LEFT JOIN ${TABLES.customerAccount} ca
      ON wcr.sf_account_id = ca.salesforce_account_id
    LEFT JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = wcr.sf_account_id
    WHERE ${whereClause}
  `;

  const openOpportunitiesSql = `
    SELECT
        COUNT(DISTINCT ooa.sf_account_id) as total_open_opportunities
    FROM ${TABLES.customerReporting} wcr
    LEFT JOIN ${TABLES.customerAccount} ca
      ON wcr.sf_account_id = ca.salesforce_account_id
    LEFT JOIN ${TABLES.accountOwners} ao
      ON ao.account_id = wcr.sf_account_id
    LEFT JOIN (
      SELECT DISTINCT sf_account_id
      FROM ${TABLES.customerOpps}
      WHERE is_closed = false
    ) ooa ON wcr.sf_account_id = ooa.sf_account_id
    WHERE ${whereClause}
      AND ooa.sf_account_id IS NOT NULL
  `;

  const [accountsResult, oppsResult] = await Promise.all([
    executeQuery(accountsAndArrSql),
    executeQuery(openOpportunitiesSql),
  ]);

  return {
    totalAccounts: accountsResult[0]?.total_accounts ?? 0,
    totalOpenOpportunities: oppsResult[0]?.total_open_opportunities ?? 0,
    totalPotentialArr: accountsResult[0]?.total_potential_arr ?? 0,
  };
}
