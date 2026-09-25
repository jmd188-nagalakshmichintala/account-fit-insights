/** Error carrying an HTTP status code, thrown from controllers/services. */
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

/** Convenience factory for 400 Bad Request. */
export function badRequest(message) {
  return new HttpError(400, message);
}
