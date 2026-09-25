import { Router } from "express";
import { getAccessSummary } from "../services/userAccessService.js";

const router = Router();

function firstHeader(req, names) {
  for (const name of names) {
    const value = req.headers[name];
    if (value) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value ?? "");
}

function displayNameFromEmail(email) {
  if (!email) return undefined;
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

// Databricks Apps injects the authenticated user via X-Forwarded-* headers.
router.get("/me", async (req, res) => {
  const email = firstHeader(req, ["x-forwarded-email"]);
  const userId = firstHeader(req, ["x-forwarded-user"]);
  const raw = firstHeader(req, ["x-forwarded-preferred-username"]);
  const forwardedName = firstHeader(req, [
    "x-forwarded-name",
    "x-forwarded-full-name",
    "x-forwarded-user-name",
    "x-forwarded-display-name",
  ]);

  // Databricks often sets preferred-username to the email address; use only the local part
  const username =
    raw && !raw.includes("@") ? raw : (raw || email || "").split("@")[0];
  const fullName =
    forwardedName ||
    (!isEmail(raw) ? raw : undefined) ||
    displayNameFromEmail(email);

  const { accessLevel, hasSltViewAccess } = await getAccessSummary({
    userId,
    email,
  });

  res.json({
    email,
    fullName,
    username,
    userId,
    accessLevel,
    hasSltViewAccess,
    gongBaseUrl: process.env.GONG_BASE_URL,
    environment: process.env.APP_ENV || "local",
  });
});

export default router;
