import { StatusMessage } from "@/components/ui/StatusMessage";

/**
 * Functional fallback rendered by `react-error-boundary` when a render-time
 * exception bubbles up. Shows a recoverable message instead of a blank screen.
 *
 * React Query handles *async* errors; the error boundary handles *render*
 * errors — the two are complementary.
 */
export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="mx-auto max-w-md p-6">
      <StatusMessage
        variant="error"
        title="Something went wrong"
        message={error?.message || "An unexpected error occurred."}
      />
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
