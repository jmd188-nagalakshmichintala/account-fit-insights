import { memo, useState } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/user";
import useCurrentUser from "@/hooks/useCurrentUser";
import { AttachmentList } from "./ChatAttachment";
import { MarkdownContent } from "./MarkdownContent";

function Avatar({ isUser }) {
  const user = useCurrentUser();

  return (
    <div
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        isUser
          ? "bg-dark-blue text-[10px] font-semibold text-white"
          : "bg-slate-200 text-slate-600",
      )}
    >
      {isUser ? getUserInitials(user) : <Sparkles className="h-3.5 w-3.5" />}
    </div>
  );
}

function QueriesToggle({ queries }) {
  const [open, setOpen] = useState(false);

  if (!queries?.length) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer text-xs font-medium text-dark-blue hover:underline"
      >
        {open ? "Hide code" : "Show code"}
      </button>

      {open && (
        <div className="mt-1.5 space-y-2">
          {queries.map((query, index) => (
            <div key={index}>
              {query.title && (
                <p className="mb-1 text-[11px] font-medium text-slate-500">
                  {query.title}
                </p>
              )}
              <pre className="m-0 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
                <code>{query.sql}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
  role,
  content,
  attachments,
  queries,
  conversationId,
  messageId,
  className,
}) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
    >
      {!isUser && <Avatar isUser={false} />}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-xs",
          isUser
            ? "bg-dark-blue text-white"
            : "bg-slate-100 text-slate-900 border border-slate-200",
        )}
      >
        {content && <MarkdownContent>{content}</MarkdownContent>}

        {attachments?.length > 0 && (
          <AttachmentList
            attachments={attachments}
            conversationId={conversationId}
            messageId={messageId}
          />
        )}

        <QueriesToggle queries={queries} />
      </div>

      {isUser && <Avatar isUser={true} />}
    </div>
  );
});
