import { cn } from "@/lib/utils";

import { useConversations } from "../hooks/useGenieConversation";
import { groupConversationsByDate } from "../utils/chat.utils";
import { ChatHistoryConversationRow } from "./ChatHistoryConversationRow";

const GROUP_LABELS = ["Today", "Yesterday", "Older"];

export function ChatHistoryPanel({
  onSelectConversation,
  activeConversationId,
  onConversationDeleted,
  className,
}) {
  const { data, isLoading } = useConversations();
  const groups = groupConversationsByDate(data?.conversations ?? []);

  return (
    <div
      className={cn(
        "scrollbar-thin flex-1 overflow-y-auto px-3 py-3",
        className,
      )}
    >
      {isLoading && (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          Loading history...
        </p>
      )}

      {!isLoading &&
        GROUP_LABELS.filter((label) => groups[label].length > 0).map(
          (label) => (
            <div key={label} className="mb-4">
              <div className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              {groups[label].map((conversation) => (
                <ChatHistoryConversationRow
                  key={conversation.conversation_id}
                  conversation={conversation}
                  isActive={
                    conversation.conversation_id === activeConversationId
                  }
                  onSelectConversation={onSelectConversation}
                  onDeleted={onConversationDeleted}
                />
              ))}
            </div>
          ),
        )}

      {!isLoading && !data?.conversations?.length && (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          No past conversations yet.
        </p>
      )}
    </div>
  );
}
