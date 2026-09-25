import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { ACTIVE_MESSAGE_STATUSES } from "../constants/chat.constants";
import { getSuggestedQuestions, messageKey } from "../utils/chat.utils";
import { ChatMessageBubble } from "./ChatMessageBubble";

function BouncingDots() {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
    </span>
  );
}

function TypingIndicator({ statusText }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex max-w-[85%] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5">
        <span className="truncate text-xs text-slate-500">
          {statusText || "Thinking"}
        </span>
        <BouncingDots />
      </div>
    </div>
  );
}

export function ChatMessageList({
  messages,
  onSend,
  conversationId,
  className,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return null;
  }

  const lastMessage = messages[messages.length - 1];
  const suggestedQuestions =
    !ACTIVE_MESSAGE_STATUSES.includes(lastMessage.status) &&
    lastMessage.status !== "FAILED" &&
    lastMessage.status !== "INTERRUPTED"
      ? getSuggestedQuestions(lastMessage)
      : [];

  return (
    <div
      className={cn(
        "scrollbar-thin flex-1 overflow-y-auto px-3 py-3 space-y-4",
        className,
      )}
    >
      {messages.map((message) => {
        const isActive = ACTIVE_MESSAGE_STATUSES.includes(message.status);
        const hasContent =
          message.attachments?.length > 0 || message.queries?.length > 0;

        return (
          <div key={messageKey(message)} className="space-y-2">
            <ChatMessageBubble role="user" content={message.content} />

            {isActive && !hasContent ? (
              <TypingIndicator statusText={message.statusText} />
            ) : message.status === "FAILED" ? (
              <ChatMessageBubble
                role="assistant"
                content="Sorry, I couldn't answer that. Please try again."
              />
            ) : message.status === "INTERRUPTED" ? (
              <ChatMessageBubble
                role="assistant"
                content="Response interrupted."
              />
            ) : hasContent ? (
              <ChatMessageBubble
                role="assistant"
                attachments={message.attachments}
                queries={message.queries}
                conversationId={conversationId}
                messageId={message.message_id}
              />
            ) : null}
          </div>
        );
      })}

      {suggestedQuestions.length > 0 && onSend && (
        <div className="flex flex-wrap gap-1.5 pl-8">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onSend(question)}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-left text-[11px] text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
