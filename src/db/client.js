import { createRequire } from "module";
import { DBSQLClient } from "@databricks/sql";

// @databricks/sql's compiled CJS output for this internal module isn't
// statically analyzable by Node's ESM/CJS interop (a plain `import` binds
// `default` to the whole exports object instead of the class), so it's
// loaded via `require` instead.
const require = createRequire(import.meta.url);
const {
  default: DatabricksOAuth,
  OAuthFlow,
} = require("@databricks/sql/dist/connection/auth/DatabricksOAuth/index.js");

let clientPromise = null;

async function connectWithM2M(client) {
  console.log("[deployed] Using M2M OAuth (app service principal credentials)");
  await client.connect({
    host: process.env.DATABRICKS_HOST,
    path: `/sql/1.0/warehouses/${process.env.DATABRICKS_WAREHOUSE_ID}`,
    authType: "databricks-oauth",
    oauthClientId: process.env.DATABRICKS_CLIENT_ID,
    oauthClientSecret: process.env.DATABRICKS_CLIENT_SECRET,
  });
}

async function connectWithU2M(client) {
  console.log("[local] Starting U2M browser OAuth (localhost:8030)...");

  // Default scope is just ["sql", "offline_access"], which genieService.js's
  // Genie REST calls need more than ("does not have required scopes: genie").
  // Requesting "genie" directly is rejected outright by Databricks' OAuth
  // server ("Scopes 'genie' are not assigned to the client
  // databricks-sql-connector") — that public client has a fixed scope
  // allowlist we can't change. "all-apis" IS allowed for this client (the
  // M2M path below already gets it), so it's the only other option to try
  // for widening this session's token beyond "sql" for Genie's REST API.
  const provider = new DatabricksOAuth({
    flow: OAuthFlow.U2M,
    host: process.env.DATABRICKS_HOST,
    scopes: ["sql", "offline_access"],
    context: client,
  });

  await client.connect({
    host: process.env.DATABRICKS_HOST,
    path: `/sql/1.0/warehouses/${process.env.DATABRICKS_WAREHOUSE_ID}`,
    authType: "custom",
    provider,
  });

  console.log("[local] U2M OAuth complete");
}

async function createClient() {
  const client = new DBSQLClient();

  const isDeployed = Boolean(
    process.env.DATABRICKS_CLIENT_ID && process.env.DATABRICKS_CLIENT_SECRET,
  );

  if (isDeployed) {
    await connectWithM2M(client);
  } else {
    await connectWithU2M(client);
  }

  return client;
}

export async function getConnectedClient() {
  if (!clientPromise) {
    clientPromise = createClient().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }

  return clientPromise;
}

export async function closeClient() {
  if (!clientPromise) {
    return;
  }

  try {
    const client = await clientPromise;
    await client.close();
  } finally {
    clientPromise = null;
  }
}
