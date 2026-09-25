import { HttpError } from "../utils/httpError.js";

/** 404 handler for unmatched API routes. */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found" });
}

/**
 * Central error middleware. Known `HttpError`s surface their status/message;
 * everything else becomes a 500 with the detail logged server-side.
 *
 * `_next` is unused but required: Express only treats a middleware as an error
 * handler when it declares 4 parameters.
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error" : err.message,
  });
}
