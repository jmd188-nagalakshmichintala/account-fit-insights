import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputBar } from "./ChatInputBar";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatHistoryPanel } from "./ChatHistoryPanel";

export function ChatPanel({
  open,
  onClose,
  onNewChat,
  historyOpen,
  onToggleHistory,
  onSelectConversation,
  onConversationDeleted,
  messages,
  conversationId,
  onSend,
  onStop,
  sending,
}) {
  const contentRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;

      const firstFocusable = contentRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    } else if (previousFocusRef.current instanceof HTMLElement) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  return createPortal(
    <div
      ref={contentRef}
      inert={!open}
      aria-modal="true"
      role="dialog"
      className={cn(
        "fixed bottom-0 right-0 top-14 z-30 flex w-[520px] max-w-[calc(100vw-1.5rem)] origin-right flex-col overflow-hidden border-l border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.2)] transition-all duration-200",
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-4 opacity-0",
      )}
    >
      <ChatHeader
        onNewChat={onNewChat}
        onToggleHistory={onToggleHistory}
        onClose={onClose}
      />

      {historyOpen ? (
        <ChatHistoryPanel
          onSelectConversation={onSelectConversation}
          activeConversationId={conversationId}
          onConversationDeleted={onConversationDeleted}
        />
      ) : !conversationId && messages.length === 0 ? (
        <ChatEmptyState onSend={onSend} disabled={sending} />
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            onSend={onSend}
            conversationId={conversationId}
          />
          <ChatInputBar onSend={onSend} onStop={onStop} disabled={sending} />
        </>
      )}
    </div>,
    document.body,
  );
}
