import { RotateCcw } from "lucide-react";
import { ExpanderToggle } from "./cells/ExpanderToggle";
import { DEPRIORITIZED_COLUMNS } from "../constants/dePrioritizedAccounts.constants";
import { renderCellValue } from "../utils/formatting.utils";

const ACCOUNT_NAME_COLUMN_KEY = "sf_account_name";
const CHILD_ROW_INDENT_PX = 28;

export function DeprioritizedAccountRow({
  row,
  isChildRow = false,
  hasChildren = false,
  isExpanded = false,
  onToggleExpand,
  onRestore,
  isRestoring,
}) {
  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-2 py-3">
        {!isChildRow && (
          <ExpanderToggle
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            rowId={row.sf_account_id}
          />
        )}
      </td>
      {DEPRIORITIZED_COLUMNS.map((column) => (
        <td key={column.key} className="px-4 py-3 text-muted-foreground">
          {column.key === ACCOUNT_NAME_COLUMN_KEY && isChildRow ? (
            <div style={{ paddingLeft: CHILD_ROW_INDENT_PX }}>
              {renderCellValue(column.key, row, isChildRow)}
            </div>
          ) : (
            renderCellValue(column.key, row, isChildRow)
          )}
        </td>
      ))}
      <td className="px-4 py-3">
        {!isChildRow && (
          <button
            type="button"
            onClick={() => onRestore(row.sf_account_id)}
            disabled={isRestoring}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Restore this account to the active list"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
        )}
      </td>
    </tr>
  );
}
