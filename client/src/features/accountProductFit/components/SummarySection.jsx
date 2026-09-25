import { StatusMessage } from "@/components/ui/StatusMessage";
import { ProductFitSummary } from "./ProductFitSummary";

export function SummarySection({ metrics, isLoading, isError, error }) {
  if (isError) {
    return (
      <StatusMessage
        variant="error"
        className="mb-6"
        message={error?.message || "Failed to load summary data"}
      />
    );
  }

  return <ProductFitSummary metrics={metrics} isLoading={isLoading} />;
}
