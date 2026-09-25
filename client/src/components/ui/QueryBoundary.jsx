import { Spinner } from "./Spinner";
import { StatusMessage } from "./StatusMessage";

export function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty = false,
  skeleton,
  loadingLabel,
  errorTitle = "Something went wrong",
  emptyMessage = "No data found.",
  children,
}) {
  if (isLoading) {
    return skeleton ?? <Spinner label={loadingLabel} />;
  }

  if (isError) {
    return (
      <StatusMessage
        variant="error"
        title={errorTitle}
        message={error?.message}
      />
    );
  }

  if (isEmpty) {
    return <StatusMessage variant="empty" message={emptyMessage} />;
  }

  return children;
}
