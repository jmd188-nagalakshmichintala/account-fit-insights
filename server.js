import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { createCorsMiddleware } from "./shared/lib/middleware/cors.js";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/lib/middleware/errorHandler.js";
import { attachUserContext } from "./shared/lib/middleware/userContext.js";
import { closeClient } from "./src/db/client.js";
import authRouter from "./src/routes/auth.js";
import customersRouter from "./src/routes/customers.js";
import accountPanelRouter from "./src/routes/account_panel.js";
import accountOwnersRouter from "./src/routes/account_owners.js";
import regionsRouter from "./src/routes/regions.js";
import sltViewRouter from "./src/routes/slt_view.js";
import chatRouter from "./src/routes/chat.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "client/dist");

const app = express();

app.use(createCorsMiddleware(cors));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    if (!req.headers["x-forwarded-user"]) {
      const mockUserId = process.env.MOCK_USER_ID || "demo-user";
      req.headers["x-forwarded-user"] = mockUserId;
      req.headers["x-forwarded-email"] = "test.user@example.com";
      req.headers["x-forwarded-preferred-username"] = "testuser";
      console.log(`[LOCAL DEV] Mocking user with ID: ${mockUserId}`);
    }
    next();
  });
}

// Extract user context from Databricks Apps X-Forwarded-* headers
app.use(attachUserContext);

// Liveness probe for the Databricks Apps runtime
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api", authRouter);
app.use("/api/customers", customersRouter);
app.use("/api/account-panel", accountPanelRouter);
app.use("/api/account-owners", accountOwnersRouter);
app.use("/api/regions", regionsRouter);
app.use("/api/slt-view", sltViewRouter);
app.use("/api/chat", chatRouter);

// 404 for unmatched API routes (non-API paths fall through to the SPA below).
app.use("/api", notFoundHandler);

// Serve the built SPA and let client-side routing handle the rest.
app.use(express.static(clientDist));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(errorHandler);

const PORT = process.env.DATABRICKS_APP_PORT || process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`Server running on :${PORT}`),
);

// Graceful shutdown: stop accepting connections, then close the SQL client.
// Databricks Apps send SIGTERM on redeploy/scale-down.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`[shutdown] received ${signal}, closing server...`);
    server.close(async () => {
      try {
        await closeClient();
        process.exit(0);
      } catch (err) {
        console.error("[shutdown] error closing SQL client:", err);
        process.exit(1);
      }
    });
  });
}
