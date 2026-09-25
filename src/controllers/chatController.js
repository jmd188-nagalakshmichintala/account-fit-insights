import {
  startConversation,
  createMessage,
  listConversations,
  deleteConversation,
  listConversationItems,
  listLegacyConversationMessages,
  getLegacyQueryResult,
  downloadLegacyVisualization,
  getSampleQuestions,
  getSpaceInfo,
  parseSseStream,
  createAgentResponseAccumulator,
} from "../services/genieService.js";
import { badRequest } from "../../shared/lib/utils/httpError.js";

function extractText(contentParts) {
  return (contentParts ?? [])
    .map((part) => (typeof part === "string" ? part : part.text))
    .filter(Boolean)
    .join("\n\n");
}

// Each executed SQL statement arrives as its own `function_call` item named
// "execute_sql", with `arguments` a JSON-encoded string of {title, sql}. Its
// paired `function_call_output` just re-renders the same result as a
// markdown table the final narrative message already includes, so that half
// is intentionally not surfaced again here — only the SQL is (for "Show
// code"). Visualizations haven't shown up in a captured response yet; any
// item type besides message/function_call/function_call_output is logged
// so a real example can be wired up when one appears.
function extractQueries(output) {
  return output
    .filter(
      (item) => item.type === "function_call" && item.name === "execute_sql",
    )
    .map((item) => {
      try {
        const { title, sql } = JSON.parse(item.arguments ?? "{}");
        return sql ? { title, sql } : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// "reasoning" items are Genie's intermediate chain-of-thought steps — the
// same "Genie's steps" the UI was already told to hide, so they're expected
// and intentionally dropped here, not logged as unrecognized.
const IGNORED_OUTPUT_TYPES = new Set(["reasoning"]);
const KNOWN_OUTPUT_TYPES = new Set([
  "message",
  "function_call",
  "function_call_output",
  ...IGNORED_OUTPUT_TYPES,
]);

function logUnrecognizedOutputItems(output) {
  const unrecognized = output.filter(
    (item) => !KNOWN_OUTPUT_TYPES.has(item.type),
  );
  if (unrecognized.length) {
    console.log(
      "[genie:agent-mode] unrecognized output items (possibly visualization):",
      JSON.stringify(unrecognized, null, 2),
    );
  }
}

function buildAssistantMessage(userContent, agentResponse) {
  const output = agentResponse.output ?? [];
  logUnrecognizedOutputItems(output);

  const answerText = extractText(
    output
      .filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? []),
  );

  return {
    conversation_id: agentResponse.conversation_id,
    message_id: `${agentResponse.conversation_id}:${Date.now()}`,
    status: agentResponse.status === "completed" ? "COMPLETED" : "FAILED",
    content: userContent,
    attachments: answerText
      ? [{ attachment_id: "answer", text: { content: answerText } }]
      : [],
    queries: extractQueries(output),
  };
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function relayAgentEvent(res, event) {
  if (event.type === "response.output_item.done" && event.item) {
    writeSse(res, "item", { item: event.item });
  }
}

export const sendMessage = async (req, res) => {
  const { content, conversationId } = req.body;
  const forwardedToken = req.user?.accessToken;

  if (!content || !content.trim()) {
    throw badRequest("content is required");
  }

  // Abort the upstream Genie request only on a genuine client disconnect.
  // req's "close" fires as soon as the request body is fully read (Express
  // already consumed it via express.json() before this handler runs), well
  // before the response is done — listening there aborted virtually every
  // request immediately. res's "close" only fires when the underlying
  // connection actually drops, and !res.writableEnded rules out the normal
  // case where it fires right after res.end() on success.
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  const sseResponse = conversationId
    ? await createMessage(
        conversationId,
        content,
        forwardedToken,
        controller.signal,
      )
    : await startConversation(content, forwardedToken, controller.signal);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  try {
    const accumulator = createAgentResponseAccumulator();
    for await (const event of parseSseStream(sseResponse)) {
      accumulator.ingest(event);
      relayAgentEvent(res, event);
    }

    const agentResponse = accumulator.finalize();
    const message = buildAssistantMessage(content, agentResponse);
    writeSse(res, "done", { message });
  } catch (error) {
    controller.abort();
    if (!res.writableEnded && !res.destroyed) {
      writeSse(res, "error", {
        message: error.message ?? "Agent response failed",
      });
    }
  } finally {
    if (!res.writableEnded && !res.destroyed) res.end();
  }
};

export const listConversationsHandler = async (req, res) => {
  res.json(await listConversations(req.user?.accessToken));
};

// A legacy message's SQL lives on a `query` attachment (not a `function_call`
// item) — pulled out here so "Show code" works the same way it does for
// Agent-mode messages. The result table/chart behind each query attachment
// is intentionally left unfetched: the frontend loads those on demand per
// attachment (see getLegacyQueryResultHandler/downloadLegacyVisualizationHandler)
// the same way the original pre-Agent-mode UI did.
function extractLegacyQueries(attachments) {
  return (attachments ?? [])
    .filter((attachment) => attachment.query?.query)
    .map((attachment) => ({
      title: attachment.query.description,
      sql: attachment.query.query,
    }));
}

async function buildLegacyMessages(conversationId, forwardedToken) {
  const response = await listLegacyConversationMessages(
    conversationId,
    forwardedToken,
  );
  const legacyMessages = response.messages ?? response ?? [];

  const messages = legacyMessages.map((message) => ({
    message_id: message.message_id,
    content: message.content,
    status: message.status,
    legacy: true,
    attachments: message.attachments ?? [],
    queries: extractLegacyQueries(message.attachments),
    created_timestamp: message.created_timestamp,
  }));

  return { messages, legacy: true };
}

// Best-effort: agent-mode conversation history is a flat list of items
// (reasoning / function calls / messages), not the old pre-grouped
// per-turn message objects — group them by user-message boundaries. Falls
// back to an empty thread (rather than crashing) if the real item shape
// turns out to differ from this guess; the raw items are logged either way.
export const listConversationMessagesHandler = async (req, res) => {
  let items;
  try {
    items = await listConversationItems(
      req.params.conversationId,
      req.user?.accessToken,
    );
  } catch (error) {
    // The space's conversation list includes conversations started outside
    // Agent mode (e.g. the native Databricks Genie chat UI), but the items
    // endpoint only serves Agent-mode conversations and 404s on the rest.
    // Fall back to the original Genie Spaces messages API for those.
    if (error.statusCode === 404 && /agent mode/i.test(error.message ?? "")) {
      return res.json(
        await buildLegacyMessages(
          req.params.conversationId,
          req.user?.accessToken,
        ),
      );
    }
    throw error;
  }

  try {
    const messages = [];
    let current = null;
    const skippedTypes = new Set();

    for (const item of items) {
      if (item.type === "message" && item.role === "user") {
        current = {
          message_id: item.id ?? `user-${messages.length}`,
          content: extractText(item.content),
          status: "COMPLETED",
          attachments: [],
          queries: [],
          created_timestamp: item.created_at ?? item.created_timestamp,
        };
        messages.push(current);
      } else if (item.type === "message" && current) {
        const text = extractText(item.content);
        if (text) {
          current.attachments.push({
            attachment_id: item.id ?? `a-${current.attachments.length}`,
            text: { content: text },
          });
        }
      } else if (
        item.type === "function_call" &&
        item.name === "execute_sql" &&
        current
      ) {
        current.queries.push(...extractQueries([item]));
      } else {
        skippedTypes.add(item.type);
      }
    }

    if (skippedTypes.size) {
      console.log(
        "[genie:agent-mode] history: skipped non-message item types (SQL / reasoning / viz):",
        [...skippedTypes],
      );
    }

    res.json({ messages });
  } catch (error) {
    console.log(
      "[genie:agent-mode] failed to group conversation items, raw items:",
      JSON.stringify(items, null, 2),
      error,
    );
    res.json({ messages: [] });
  }
};

export const deleteConversationHandler = async (req, res) => {
  await deleteConversation(req.params.conversationId, req.user?.accessToken);
  res.json({});
};

// Sample questions and the space title are static, space-wide config (not
// user-specific data), but the Genie Spaces API only returns them
// (`serialized_space`) to callers with CAN_MANAGE on the space. Fetching
// with the app's own service-principal token instead of the end user's
// forwarded token means every user sees them regardless of their own
// space permissions — requires CAN_MANAGE granted to the deployed app's SP.
export const getSampleQuestionsHandler = async (req, res) => {
  res.json({ questions: await getSampleQuestions() });
};

export const getSpaceInfoHandler = async (req, res) => {
  res.json(await getSpaceInfo());
};

// Only reached for legacy (non-Agent-mode) messages — Agent mode inlines its
// answer table as markdown, so it never needs a per-attachment fetch.
export const getLegacyQueryResultHandler = async (req, res) => {
  const { conversationId, messageId, attachmentId } = req.params;
  res.json(
    await getLegacyQueryResult(
      conversationId,
      messageId,
      attachmentId,
      req.user?.accessToken,
    ),
  );
};

export const downloadLegacyVisualizationHandler = async (req, res) => {
  const { conversationId, messageId, attachmentId } = req.params;
  const { contentType, body } = await downloadLegacyVisualization(
    conversationId,
    messageId,
    attachmentId,
    req.user?.accessToken,
  );
  res.type(contentType).send(body);
};
