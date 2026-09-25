export function CheckboxFilter({ value, onChange, label, id, ariaLabel }) {
  const isChecked = value === true;

  const handleChange = (e) => {
    onChange(e.target.checked ? true : null);
  };

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-border hover:bg-muted/30">
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        aria-label={ariaLabel}
        className="size-4 cursor-pointer rounded border-gray-300 text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    </label>
  );
}
