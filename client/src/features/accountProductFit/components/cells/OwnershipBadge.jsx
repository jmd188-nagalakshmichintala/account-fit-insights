export function OwnershipBadge({ showRevenueText = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        Owned
      </span>
      {showRevenueText && (
        <span className="text-xs text-blue-600">
          Transactional Revenue Available
        </span>
      )}
    </div>
  );
}
