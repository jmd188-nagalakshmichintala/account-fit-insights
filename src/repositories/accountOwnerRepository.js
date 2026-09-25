import { executeQuery } from "../db/query.js";
import { TABLES } from "../config.js";
import { toSqlLiteral } from "../../shared/lib/utils/sql.js";

export function fetchAccountOwners() {
  const sql = `
    SELECT DISTINCT
        owner_email
      , owner_name
    FROM ${TABLES.accountOwners}
    WHERE owner_email IS NOT NULL
    ORDER BY owner_name
  `;

  return executeQuery(sql);
}

export function fetchAccountOwnersForUser(allowedAccountIds = []) {
  if (allowedAccountIds === null) {
    return fetchAccountOwners();
  }

  if (!allowedAccountIds.length) {
    return Promise.resolve([]);
  }

  const idList = allowedAccountIds.map(toSqlLiteral).join(", ");

  const sql = `
    SELECT DISTINCT
        owner_email
      , owner_name
    FROM ${TABLES.accountOwners}
    WHERE owner_email IS NOT NULL
      AND account_id IN (${idList})
    ORDER BY owner_name
  `;

  return executeQuery(sql);
}
