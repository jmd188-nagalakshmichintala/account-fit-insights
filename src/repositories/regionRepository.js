import { executeQuery } from "../db/query.js";
import { TABLES } from "../config.js";
import { toSqlLiteral } from "../../shared/lib/utils/sql.js";

export function fetchRegions() {
  const sql = `
    SELECT DISTINCT region
    FROM ${TABLES.customerAccount}
    WHERE region IS NOT NULL
    ORDER BY region
  `;

  return executeQuery(sql);
}

export function fetchRegionsForUser(allowedAccountIds = []) {
  if (allowedAccountIds === null) {
    return fetchRegions();
  }

  if (!allowedAccountIds.length) {
    return Promise.resolve([]);
  }

  const idList = allowedAccountIds.map(toSqlLiteral).join(", ");

  const sql = `
    SELECT DISTINCT region
    FROM ${TABLES.customerAccount}
    WHERE region IS NOT NULL
      AND salesforce_account_id IN (${idList})
    ORDER BY region
  `;

  return executeQuery(sql);
}
