export function ChartHeader({
  title,
  tabs,
  activeTab,
  onTabChange,
  showCheckbox,
  checkboxLabel,
  checkboxChecked,
  onCheckboxChange,
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>

      <div className="flex items-center gap-4">
        {showCheckbox && (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => onCheckboxChange(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{checkboxLabel}</span>
          </label>
        )}

        {tabs && tabs.length > 0 && (
          <div className="inline-flex overflow-hidden rounded border border-gray-300">
            {tabs.map((tab, index) => (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`cursor-pointer px-4 py-1.5 text-xs font-medium transition-all ${
                  index > 0 ? "border-l border-gray-300" : ""
                } ${
                  activeTab === tab.value
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
