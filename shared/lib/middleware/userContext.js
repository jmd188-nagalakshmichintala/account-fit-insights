/**
 * Extract user information from Databricks Apps X-Forwarded-* headers and attach
 * it to req.user for downstream use.
 *
 * This middleware must run before any route handler that needs user context for
 * authorization or filtering.
 */

function firstHeader(req, names) {
  for (const name of names) {
    const value = req.headers[name];
    if (value) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

export function attachUserContext(req, res, next) {
  const email = firstHeader(req, ["x-forwarded-email"]);
  const userId = firstHeader(req, ["x-forwarded-user"]);
  const username = firstHeader(req, ["x-forwarded-preferred-username"]);
  // On-behalf-of-user token Databricks Apps forwards once the app declares
  // user_api_scopes; only present when deployed, not during local dev. Locally,
  // fall back to a PAT (DATABRICKS_LOCAL_PAT) — the U2M session's SQL-connector
  // OAuth token can't be scoped to "genie", but a PAT carries full user
  // permissions and works against the Genie REST API unscoped.
  const accessToken =
    firstHeader(req, ["x-forwarded-access-token"]) ||
    process.env.DATABRICKS_LOCAL_PAT;

  // Attach user context to the request object for downstream layers
  req.user = {
    userId,
    email,
    username,
    accessToken,
  };

  next();
}
