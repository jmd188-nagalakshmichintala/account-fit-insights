import { Sparkles } from "lucide-react";

import {
  useSampleQuestions,
  useSpaceInfo,
} from "../hooks/useGenieConversation";
import { ChatInputBar } from "./ChatInputBar";

export function ChatEmptyState({ onSend, disabled }) {
  const { data: spaceInfo } = useSpaceInfo();
  const { data } = useSampleQuestions();
  const questions = data?.questions ?? [];
  const title = spaceInfo?.title || "Ask Genie anything";

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-dark-blue">
        <Sparkles className="h-5 w-5" />
      </div>

      <p className="mt-3 text-base font-semibold text-slate-900">{title}</p>

      <div className="mt-6 w-full max-w-sm">
        <ChatInputBar
          onSend={onSend}
          disabled={disabled}
          className="border-0 px-0 py-0"
          textareaClassName="rounded-2xl shadow-sm px-4 py-3"
        />
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Always review the accuracy of responses.
        </p>
      </div>

      {questions.length > 0 && (
        <div className="mt-6 w-full max-w-sm divide-y divide-slate-100 border-t border-slate-100">
          {questions.slice(0, 5).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSend(sample.question)}
              className="block w-full cursor-pointer py-3 text-left text-xs text-dark-blue transition-colors hover:bg-slate-50"
            >
              {sample.question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
