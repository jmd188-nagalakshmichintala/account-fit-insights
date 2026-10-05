# Account Fit Insights

A Databricks App that surfaces account-product-fit data from Unity Catalog as a dashboard. Users browse account fit scores, ARR potential, and engagement details directly from the browser, authenticated via Databricks identity. Every authenticated user has full access to the data — there is no per-user access restriction.

## Architecture

```
client/          React 19 + Vite + Tailwind CSS (frontend)
src/             Node.js / Express (backend API)
```

The Express server connects to a Databricks SQL warehouse and exposes a small REST API. The React client calls that API to fetch and update rows. On deployed environments, the app uses **M2M OAuth** (service principal credentials); locally it falls back to **U2M browser OAuth**. The Genie chat widget shares this same session — it has no separate credential of its own.

## Prerequisites

- Node.js 18+
- A Databricks workspace with:
  - A SQL warehouse
  - The table in Unity Catalog with required permissions
  - (Local only) OAuth U2M enabled

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABRICKS_HOST` | Yes | Workspace URL, e.g. `https://adb-xxxx.azuredatabricks.net` |
| `DATABRICKS_WAREHOUSE_ID` | Yes | SQL warehouse ID |
| `DATABRICKS_CLIENT_ID` | Deployed only | Service principal client ID (M2M OAuth) |
| `DATABRICKS_CLIENT_SECRET` | Deployed only | Service principal client secret (M2M OAuth) |
| `TARGET_CATALOG` | No (defaults to `databricks_apps`) | Unity Catalog catalog the app reads from |
| `TARGET_SCHEMA` | No (defaults to `account_intelligence`) | Schema within `TARGET_CATALOG` the app reads from |
| `DATABRICKS_GENIE_SPACE_ID` | No | Genie space ID the chat widget queries — leave unset to disable the widget until a Genie space exists |
| `DATABRICKS_LOCAL_PAT` | Local only | Personal access token the chat widget's Genie calls use locally, since the U2M session can't be scoped to `genie`; not needed once deployed |
| `MOCK_USER_ID` | No (local only) | Only relevant if you re-enable the mock-header block in `server.js` (currently commented out) — overrides the placeholder user ID it injects when no `X-Forwarded-User` header is present |

When `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET` are both set, the server uses M2M OAuth. Otherwise it opens a browser for U2M OAuth (local dev only). The chat widget's Genie calls reuse this same session/token — there's no separate credential to configure for it.

## Local development

**1. Install dependencies**

```bash
# Backend
npm install

# Frontend
cd client && npm install
```

**2. Set environment variables**

```bash
DATABRICKS_HOST=https://adb-xxxx.azuredatabricks.net
DATABRICKS_WAREHOUSE_ID=your_warehouse_id
```

**3. Start the backend**

```bash
node server.js
```

The first request triggers a browser-based OAuth login.

**4. Start the frontend**

```bash
cd client
npm start        # Vite dev server at http://localhost:5173
```

The Vite dev server proxies `/api` requests to the Express server.

## Frontend build

```bash
cd client && npm run build
```

Output goes to `client/dist/`. The Express server serves these static files in production.

## Deployment (Databricks Asset Bundles)

This app deploys as a **Databricks App** via a Databricks Asset Bundle:

- `databricks.yml` — bundle definition + `dev` target (points at the JMAN sandbox workspace)
- `resources/apps.yml` — declares the `account-fit-insights` app and its `sql-warehouse` resource
- `app.yaml` — runtime command (`node server.js`) and environment variables for the deployed app
- `.github/workflows/deploy.yml` — GitHub Actions workflow: on every push to `main` (or manual trigger), it lints, builds, then runs `databricks bundle validate` → `databricks bundle deploy` → `databricks bundle run account_fit_insights`. Requires a repository secret `DATABRICKS_TOKEN` (a Databricks PAT scoped to `apps`, `workspace`, `sql`, and `access-management`).

**Manual deploy** (no CI), from a machine with the Databricks CLI authenticated to the target workspace:
```bash
databricks bundle deploy -t dev --profile <your-profile>
databricks bundle run account_fit_insights -t dev --profile <your-profile>
```

**After any deploy that recreates the app** (e.g. after deleting and letting the bundle create it fresh), the app gets a **new** auto-provisioned service principal with its own client ID. That principal needs Unity Catalog grants before the app can query anything:
```sql
GRANT USE CATALOG ON CATALOG databricks_apps TO `<service-principal-client-id>`;
GRANT USE SCHEMA ON SCHEMA databricks_apps.account_intelligence TO `<service-principal-client-id>`;
GRANT SELECT ON SCHEMA databricks_apps.account_intelligence TO `<service-principal-client-id>`;
GRANT MODIFY ON SCHEMA databricks_apps.account_intelligence TO `<service-principal-client-id>`;
```
Find the client ID via `databricks apps get account-fit-insights` (field `service_principal_client_id`).
