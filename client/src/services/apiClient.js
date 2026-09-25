/**
 * Centralised HTTP helpers used by every data hook/service.
 *
 * Keeping the fetch + error-parsing logic in one place means each hook only
 * has to describe *what* to fetch, not *how* to fetch it.
 */

/**
 * Build a URL with an optional query-string from a plain params object.
 * `null` / `undefined` / `""` values are skipped so callers don't have to
 * conditionally assemble query strings themselves.
 *
 * Array values are appended as repeated params (`?x=a&x=b`), which the backend
 * parses back into an array — used for multi-value filters. Empty arrays emit
 * nothing.
 *
 * @param {string} endpoint
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
export function buildUrl(endpoint, params) {
  if (!params) return endpoint;

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined || item === "") continue;
        searchParams.append(key, String(item));
      }
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Fetch JSON and throw a meaningful Error when the response is not ok.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>}
 */
export async function fetchJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || body.details || `Request failed (${response.status})`,
    );
  }

  return response.json();
}

/**
 * POST/fetch a request and read back a `event:`/`data:` SSE stream,
 * invoking `onEvent(eventType, data)` per frame as it arrives.
 *
 * Uses fetch()+getReader() rather than the browser's EventSource, since this
 * needs a POST with a JSON body (EventSource only supports GET with no
 * custom body).
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {(eventType: string, data: unknown) => void} onEvent
 * @returns {Promise<void>}
 */
export async function fetchEventStream(url, options, onEvent) {
  const response = await fetch(url, options);

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || body.details || `Request failed (${response.status})`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventType = "message";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "");

      if (line === "") {
        eventType = "message";
        continue;
      }
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;
        try {
          onEvent(eventType, JSON.parse(jsonStr));
        } catch {
          // ignore malformed frame
        }
      }
    }
  }
}
