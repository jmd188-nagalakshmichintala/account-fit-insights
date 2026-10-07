import { HttpError } from "../../shared/lib/utils/httpError.js";
import { getConnectedClient } from "../db/client.js";

function workspaceHost() {
  const host = process.env.DATABRICKS_HOST ?? "";
  return /^https?:\/\//.test(host) ? host : `https://${host}`;
}

const AGENT_ID = process.env.DATABRICKS_GENIE_SPACE_ID; // Same id works for both the agents and spaces namespaces.

function agentPath(path) {
  return `/api/2.0/genie/agents/${AGENT_ID}${path}`;
}

function spacePath(path) {
  return `/api/2.0/genie/spaces/${AGENT_ID}${path}`;
}

// Deployed: Databricks Apps forwards the logged-in user's own access token
// (once the app declares user_api_scopes including "genie") via the
// X-Forwarded-Access-Token header — attached to req.user.accessToken by
// attachUserContext.
//
// Local: there's no Databricks Apps proxy to forward a token, so this falls
// back to db/client.js's shared U2M browser-OAuth session. getAuthProvider()
// is internal to @databricks/sql (not part of its public API) but is the
// only way to pull a raw bearer token out of an already-authenticated client.
async function getAccessToken(forwardedToken) {
  if (forwardedToken) return forwardedToken;

  const client = await getConnectedClient();
  const { Authorization } = await client.getAuthProvider().authenticate();
  return Authorization.replace(/^Bearer\s+/i, "");
}

async function parseErrorMessage(response) {
  const text = await response.text();
  try {
    return JSON.parse(text).error?.message ?? JSON.parse(text).message ?? text;
  } catch {
    return text;
  }
}

async function spaceFetch(path, init = {}, forwardedToken) {
  const response = await fetch(`${workspaceHost()}${spacePath(path)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await getAccessToken(forwardedToken)}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, await parseErrorMessage(response));
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function agentFetch(path, init = {}, forwardedToken) {
  const response = await fetch(`${workspaceHost()}${agentPath(path)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await getAccessToken(forwardedToken)}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, await parseErrorMessage(response));
  }

  return response;
}

// An SSE line is `field:value` or `field: value` — the spec doesn't require
// the space, and this endpoint omits it (`data:{...}`, `event:response...`).
function parseSseField(line) {
  const colonIndex = line.indexOf(":");
  if (colonIndex === -1) return null;
  return {
    field: line.slice(0, colonIndex),
    value: line.slice(colonIndex + 1).trimStart(),
  };
}

// Agent mode streams its response as SSE (`event:` + `data:` line pairs per
// frame). Yields each parsed `data:` event as it arrives so callers can
// relay events live instead of waiting for the whole response.
export async function* parseSseStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "");
      const parsed = parseSseField(line);
      if (!parsed || parsed.field !== "data") continue;

      const jsonStr = parsed.value.trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        yield JSON.parse(jsonStr);
      } catch {
        continue;
      }
    }
  }
}

export function createAgentResponseAccumulator() {
  let finalResponse = null;
  let conversationId = null;
  const outputItems = [];
  const seenEventTypes = new Set();

  return {
    ingest(event) {
      seenEventTypes.add(event.type);

      if (
        event.type === "response.completed" ||
        event.type === "response.done"
      ) {
        finalResponse = event.response;
      } else if (event.type === "response.failed" || event.type === "error") {
        throw new HttpError(
          500,
          event.response?.error?.message ??
            event.error?.message ??
            "Agent response failed",
        );
      } else if (event.type === "response.output_item.done" && event.item) {
        outputItems.push(event.item);
        conversationId = conversationId ?? event.response?.conversation_id;
      } else if (event.response?.conversation_id) {
        conversationId = conversationId ?? event.response.conversation_id;
      }
    },

    finalize() {
      if (!finalResponse && outputItems.length) {
        finalResponse = {
          conversation_id: conversationId,
          status: "completed",
          output: outputItems,
        };
      }

      if (!finalResponse) {
        throw new HttpError(
          502,
          `Agent mode stream ended without a completed response (saw event types: ${[...seenEventTypes].join(", ") || "none"})`,
        );
      }

      return finalResponse;
    },
  };
}

// Response shape: { conversation_id, status: "completed", output: [
//   { type: "reasoning", content: [...] },
//   { type: "function_call", name: "execute_sql", ... },
//   { type: "function_call_output", content: [...] }, // query rows/columns — shape TBD, logged in the controller for now
//   { type: "message", content: [{ type: "output_text", text }] },
// ] }
async function agentRespond(content, conversationId, forwardedToken, signal) {
  // `content` must be an array of content parts (mirrors the `output_text`
  // parts we parse back out of the response) — a plain string 400s with a
  // Jackson "expected Seq" deserialization error.
  const body = {
    input: [
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: content }],
      },
    ],
    enable_viz: true,
  };
  if (conversationId) body.conversation_id = conversationId;

  return agentFetch(
    "/responses",
    {
      method: "POST",
      headers: { Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal,
    },
    forwardedToken,
  );
}

export async function startConversation(content, forwardedToken, signal) {
  return agentRespond(content, null, forwardedToken, signal);
}

export async function createMessage(
  conversationId,
  content,
  forwardedToken,
  signal,
) {
  return agentRespond(content, conversationId, forwardedToken, signal);
}

// Agent-mode conversations live in the agents namespace, not the classic
// genie/spaces one — listing/paginating them has to go through this endpoint
// rather than the old spaces conversations/messages APIs.
export async function listConversationItems(conversationId, forwardedToken) {
  const allItems = [];
  let after = null;

  while (true) {
    const params = new URLSearchParams({ order: "asc", limit: "100" });
    if (after) params.set("after", after);

    const response = await agentFetch(
      `/conversations/${conversationId}/items?${params}`,
      {},
      forwardedToken,
    );
    const page = await response.json();
    allItems.push(...(page.data ?? []));

    if (!page.has_more) break;
    after = page.last_id;
  }

  return allItems;
}

const ACCOUNT_SUMMARY_TITLE_PATTERN = /account summary/i;

export async function listConversations(forwardedToken) {
  const result = await spaceFetch("/conversations", {}, forwardedToken);
  return {
    ...result,
    conversations: (result.conversations ?? []).filter(
      (conversation) =>
        !ACCOUNT_SUMMARY_TITLE_PATTERN.test(conversation.title ?? ""),
    ),
  };
}

export async function deleteConversation(conversationId, forwardedToken) {
  return spaceFetch(
    `/conversations/${conversationId}`,
    { method: "DELETE" },
    forwardedToken,
  );
}

// Legacy (pre-Agent-mode) conversations — e.g. ones started via the native
// Databricks Genie chat UI — never appear in the agent-mode items list (that
// endpoint 404s on them). These read-only helpers hit the original Genie
// Spaces conversation API so conversation history can still display them.
// Unlike Agent mode's inline markdown answers, a legacy message's query
// result/chart aren't embedded — they're fetched separately per attachment.
export async function listLegacyConversationMessages(
  conversationId,
  forwardedToken,
) {
  return spaceFetch(
    `/conversations/${conversationId}/messages`,
    {},
    forwardedToken,
  );
}

export async function getLegacyQueryResult(
  conversationId,
  messageId,
  attachmentId,
  forwardedToken,
) {
  return spaceFetch(
    `/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}/query-result`,
    {},
    forwardedToken,
  );
}

export async function downloadLegacyVisualization(
  conversationId,
  messageId,
  attachmentId,
  forwardedToken,
) {
  const response = await fetch(
    `${workspaceHost()}${spacePath(`/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}/download-visualization`)}`,
    {
      headers: {
        Authorization: `Bearer ${await getAccessToken(forwardedToken)}`,
      },
    },
  );

  if (!response.ok) {
    throw new HttpError(response.status, await parseErrorMessage(response));
  }

  return {
    contentType: response.headers.get("content-type"),
    body: Buffer.from(await response.arrayBuffer()),
  };
}

// Space-level config (title, sample questions) is unrelated to agent mode's
// conversation data, so this stays on the spaces API.
export async function getSpaceInfo(forwardedToken) {
  const space = await spaceFetch("", {}, forwardedToken);
  return { title: space.title };
}

// Sample questions are static, space-admin-configured prompts (not answer-
// specific follow-ups) buried inside a JSON-encoded `serialized_space` string
// on the space object. Their location depends on the space's schema version:
// version 2 stores them under instructions.example_question_sqls, while
// older spaces use config.sample_questions.
export async function getSampleQuestions(forwardedToken) {
  const space = await spaceFetch(
    "?include_serialized_space=true",
    {},
    forwardedToken,
  );
  const serializedSpace = JSON.parse(space.serialized_space ?? "{}");
  const sampleQuestions =
    serializedSpace.instructions?.example_question_sqls ??
    serializedSpace.config?.sample_questions ??
    [];

  return sampleQuestions.map((sample) => ({
    id: sample.id,
    question: Array.isArray(sample.question)
      ? sample.question[0]
      : sample.question,
  }));
}
