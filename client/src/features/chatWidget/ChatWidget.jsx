import { useEffect, useState } from "react";

import { ChatLauncherButton } from "./components/ChatLauncherButton";
import { ChatPanel } from "./components/ChatPanel";
import { useChatConversation } from "./hooks/useChatConversation";
import { CHAT_OPEN_STORAGE_KEY } from "./constants/chat.constants";

export function ChatWidget({ onOpenChange, accountPanelOpen }) {
  const [open, setOpen] = useState(
    () => sessionStorage.getItem(CHAT_OPEN_STORAGE_KEY) === "true",
  );
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    conversationId,
    messages,
    sending,
    handleSend,
    handleStop,
    handleNewChat,
    handleConversationDeleted,
    handleSelectConversation,
  } = useChatConversation();

  useEffect(() => {
    sessionStorage.setItem(CHAT_OPEN_STORAGE_KEY, String(open));
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Keep the two right-side panels mutually exclusive — opening the account
  // details panel should close Genie, since they'd otherwise overlap.
  useEffect(() => {
    if (accountPanelOpen) setOpen(false);
  }, [accountPanelOpen]);

  const startNewChat = () => {
    handleNewChat();
    setHistoryOpen(false);
  };

  const selectConversation = async (id) => {
    if (await handleSelectConversation(id)) {
      setHistoryOpen(false);
    }
  };

  return (
    <>
      {!open && <ChatLauncherButton onClick={() => setOpen(true)} />}

      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
        onNewChat={startNewChat}
        historyOpen={historyOpen}
        onToggleHistory={() => setHistoryOpen((prev) => !prev)}
        onSelectConversation={selectConversation}
        onConversationDeleted={handleConversationDeleted}
        messages={messages}
        conversationId={conversationId}
        onSend={handleSend}
        onStop={handleStop}
        sending={sending}
      />
    </>
  );
}
