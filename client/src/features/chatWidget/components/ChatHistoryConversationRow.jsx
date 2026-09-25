import { useState } from "react";
import { Check, MessageSquare, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import { useDeleteConversation } from "../hooks/useGenieConversation";

export function ChatHistoryConversationRow({
  conversation,
  isActive,
  onSelectConversation,
  onDeleted,
}) {
  const [confirming, setConfirming] = useState(false);
  const { showToast } = useToast();
  const deleteConversation = useDeleteConversation();

  const handleDelete = (event) => {
    event.stopPropagation();
    deleteConversation.mutate(conversation.conversation_id, {
      onSuccess: () => onDeleted?.(conversation.conversation_id),
      onError: (error) => {
        showToast(
          error?.message || "Failed to delete conversation. Please try again.",
          "error",
        );
      },
    });
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-700">
        <span className="flex-1 truncate text-slate-500">
          Delete this conversation?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Confirm delete"
          className="cursor-pointer rounded-sm p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setConfirming(false);
          }}
          aria-label="Cancel delete"
          className="cursor-pointer rounded-sm p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 transition-colors",
        isActive && "bg-slate-100",
      )}
    >
      <button
        type="button"
        onClick={() => onSelectConversation(conversation.conversation_id)}
        className="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden text-left"
      >
        <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">
          {conversation.title || "Untitled conversation"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete conversation"
        className="shrink-0 cursor-pointer rounded-sm p-1 text-slate-300 opacity-0 hover:bg-slate-200 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
