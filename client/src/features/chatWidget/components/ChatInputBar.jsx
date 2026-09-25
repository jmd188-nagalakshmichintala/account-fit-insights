import { useState } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInputBar({
  onSend,
  onStop,
  disabled,
  className,
  textareaClassName,
}) {
  const [value, setValue] = useState("");

  const send = () => {
    const content = value.trim();
    if (!content || disabled) return;
    onSend(content);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 border-t border-slate-200 px-3 py-3 shrink-0",
        className,
      )}
    >
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask your question..."
        rows={1}
        className={cn(
          "flex-1 resize-none border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-dark-blue max-h-32",
          textareaClassName,
        )}
      />
      {disabled ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop response"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-dark-blue text-white transition-colors"
        >
          <Square className="h-3.5 w-3.5" fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={!value.trim()}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-dark-blue text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
