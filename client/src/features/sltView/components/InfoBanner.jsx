export function InfoBanner({ children, className = "mb-4" }) {
  return (
    <div
      className={`flex items-start gap-2.5 px-2 text-xs text-slate-600 ${className}`}
    >
      <p>{children}</p>
    </div>
  );
}
