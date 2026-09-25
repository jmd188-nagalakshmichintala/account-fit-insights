import { Sparkles } from "lucide-react";
import { MarkdownContent } from "@/features/chatWidget/components/MarkdownContent";

const PLACEHOLDER_SUMMARY = `**How this gets generated:** a scheduled job builds a per-account data feed — fleet profile, current product holdings and ARR, propensity scores and trends for products the account doesn't yet own, the scoring rules behind any recent change, recent opportunity activity, and relevant industry news matched to the account's industry and state. That feed is only reprocessed when something meaningful has changed, then passed through an LLM prompt that writes a concise, plain-language summary — an account overview, the strongest cross-sell opportunity and why, and a couple of relevant news items framed as conversation openers. The result is written back into the account's \`ai_summary\` field and rendered here.

No summary has been generated for this account yet.`;

export function AccountSummary({ account }) {
  const aiSummary = account?.aiSummary;
  const isPlaceholder = !aiSummary;

  return (
    <div
      className={
        isPlaceholder
          ? "rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 p-4"
          : "rounded-2xl bg-indigo-50/60 p-4"
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          AI Summary
        </h3>
        {isPlaceholder && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Not yet generated
          </span>
        )}
      </div>

      <div className={isPlaceholder ? "text-muted-foreground" : undefined}>
        <MarkdownContent>
          {isPlaceholder ? PLACEHOLDER_SUMMARY : aiSummary}
        </MarkdownContent>
      </div>
    </div>
  );
}
