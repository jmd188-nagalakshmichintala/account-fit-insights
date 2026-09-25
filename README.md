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
| `DATABRICKS_GENIE_SPACE_ID` | Yes | Genie space ID the chat widget queries |
| `DATABRICKS_LOCAL_PAT` | Local only | Personal access token the chat widget's Genie calls use locally, since the U2M session can't be scoped to `genie`; not needed once deployed |
| `MOCK_USER_ID` | No (local only) | Overrides the placeholder user ID `server.js` mocks locally when no `X-Forwarded-User` header is present |

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
