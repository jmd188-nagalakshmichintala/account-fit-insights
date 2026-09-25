import { useRef, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  streamMessage,
  useLoadConversationMessages,
} from "./useGenieConversation";
import {
  tempMessageId,
  statusTextFromReasoning,
  statusTextFromQuery,
} from "../utils/chat.utils";

/** Owns conversation state and the send/stream/history handlers for ChatWidget. */
export function useChatConversation() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const activeRequestRef = useRef(null);

  const { showToast } = useToast();
  const loadConversationMessages = useLoadConversationMessages();

  const handleSend = (content) => {
    if (activeRequestRef.current) return;

    const tempId = tempMessageId();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content,
        status: "IN_PROGRESS",
        attachments: [],
        queries: [],
      },
    ]);
    setSending(true);

    const patchTemp = (patch) =>
      setMessages((prev) =>
        prev.map((existing) =>
          existing.id === tempId ? { ...existing, ...patch } : existing,
        ),
      );

    const controller = new AbortController();
    activeRequestRef.current = controller;

    streamMessage(
      { content, conversationId, signal: controller.signal },
      {
        // Databricks' Agent-mode stream never emits token-level text
        // deltas — only whole completed items (reasoning, function_call,
        // function_call_output, message) — so there's no answer text to
        // reveal early. Use reasoning/function_call items instead to show
        // a live "what Genie is doing" status while the final answer is
        // being composed, in place of a content-free typing indicator.
        onItem: (item) => {
          if (item.type === "reasoning") {
            const text = statusTextFromReasoning(item);
            if (text) patchTemp({ statusText: text });
          } else if (
            item.type === "function_call" &&
            item.name === "execute_sql"
          ) {
            patchTemp({ statusText: statusTextFromQuery(item) });
          }
        },
        onDone: (message) => {
          activeRequestRef.current = null;
          setConversationId((prev) => message.conversation_id ?? prev);
          setMessages((prev) =>
            prev.map((existing) =>
              existing.id === tempId ? message : existing,
            ),
          );
          setSending(false);
        },
        onError: (error) => {
          activeRequestRef.current = null;
          if (error?.name === "AbortError") {
            // User-initiated (clicked "Stop") — not a failure, so no toast.
            patchTemp({ status: "INTERRUPTED" });
          } else {
            patchTemp({ status: "FAILED" });
            showToast(
              error?.message || "Failed to send message. Please try again.",
              "error",
            );
          }
          setSending(false);
        },
      },
    );
  };

  const handleStop = () => {
    activeRequestRef.current?.abort();
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleConversationDeleted = (deletedId) => {
    if (deletedId === conversationId) {
      setConversationId(null);
      setMessages([]);
    }
  };

  const handleSelectConversation = async (id) => {
    try {
      const result = await loadConversationMessages(id);
      const loadedMessages = [...(result.messages ?? result)].sort(
        (a, b) => (a.created_timestamp ?? 0) - (b.created_timestamp ?? 0),
      );

      setConversationId(id);
      setMessages(loadedMessages);
      return true;
    } catch (error) {
      showToast(
        error?.message || "Failed to load conversation. Please try again.",
        "error",
      );
      return false;
    }
  };

  return {
    conversationId,
    messages,
    sending,
    handleSend,
    handleStop,
    handleNewChat,
    handleConversationDeleted,
    handleSelectConversation,
  };
}
