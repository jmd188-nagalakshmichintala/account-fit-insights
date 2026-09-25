import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

// Genie's agent-mode answers embed GitHub-flavored markdown tables directly
// in the narrative text (pipe tables) — remark-gfm parses those; without it
// they fall back to literal `| a | b |` text. Tables also render inside a
// scrollable wrapper since query results can be wider than the chat bubble.
const MARKDOWN_COMPONENTS = {
  table: ({ ...props }) => (
    <div className="my-2 overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full border-collapse text-[11px]" {...props} />
    </div>
  ),
  thead: ({ ...props }) => (
    <thead className="bg-slate-50 text-base" {...props} />
  ),
  th: ({ ...props }) => (
    <th
      className="whitespace-nowrap border border-slate-200 text-sm px-2 py-1.5 text-left font-medium text-slate-700"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="whitespace-nowrap border border-slate-200 text-sm px-2 py-1.5 align-top"
      {...props}
    />
  ),
  h1: ({ ...props }) => (
    <h1
      className="mt-3 mb-1.5 text-sm font-semibold text-slate-900"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="mt-3 mb-1.5 text-sm font-semibold text-slate-900"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="mt-2.5 mb-1 text-xs font-semibold text-slate-900"
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4 className="mt-2 mb-1 text-xs font-semibold text-slate-900" {...props} />
  ),
  strong: ({ ...props }) => (
    <strong className="font-semibold text-sm text-slate-900" {...props} />
  ),
  hr: ({ ...props }) => <hr className="my-3 border-slate-200" {...props} />,
  ul: ({ ...props }) => (
    <ul className="my-2 list-disc pl-4 text-sm" {...props} />
  ),
  blockquote: ({ ...props }) => (
    <blockquote
      className="my-2 border-l-2 border-slate-300 pl-2 text-slate-600 italic"
      {...props}
    />
  ),
  code: ({ ...props }) => (
    <code
      className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[11px]"
      {...props}
    />
  ),
  a: ({ ...props }) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-dark-blue underline hover:no-underline"
      {...props}
    />
  ),
};

export const MarkdownContent = memo(function MarkdownContent({
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "leading-loose [&>*:first-child]:mt-0 [&_li]:leading-6 [&_li]:my-2 [&_p]:leading-6 [&_p]:my-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
