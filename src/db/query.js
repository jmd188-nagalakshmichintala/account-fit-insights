import { getConnectedClient } from "./client.js";

/**
 * Execute a SQL statement and return all rows.
 *
 * Centralises the open-session / execute / fetch / close lifecycle so
 * repositories only describe the query itself.
 *
 * @param {string} sql
 * @returns {Promise<Array<Object>>}
 */
export async function executeQuery(sql) {
  const client = await getConnectedClient();
  const session = await client.openSession();
  let operation;

  try {
    operation = await session.executeStatement(sql);
    return await operation.fetchAll();
  } finally {
    if (operation) {
      await operation.close().catch(() => {});
    }
    await session.close().catch(() => {});
  }
}
