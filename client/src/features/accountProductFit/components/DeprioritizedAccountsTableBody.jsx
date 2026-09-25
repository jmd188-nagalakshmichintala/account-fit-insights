import { Fragment } from "react";
import { DeprioritizedAccountRow } from "./DeprioritizedAccountRow";

export function DeprioritizedAccountsTableBody({
  groups,
  expandedIds,
  onToggleExpand,
  onRestore,
  isRestoring,
}) {
  return (
    <tbody>
      {groups.map(({ topAccount, childAccounts }) => {
        const isExpanded = expandedIds.has(topAccount.sf_account_id);
        return (
          <Fragment key={topAccount.sf_account_id}>
            <DeprioritizedAccountRow
              row={topAccount}
              hasChildren={childAccounts.length > 0}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              onRestore={onRestore}
              isRestoring={isRestoring}
            />
            {isExpanded &&
              childAccounts.map((child) => (
                <DeprioritizedAccountRow
                  key={child.sf_account_id}
                  row={child}
                  isChildRow
                  onRestore={onRestore}
                  isRestoring={isRestoring}
                />
              ))}
          </Fragment>
        );
      })}
    </tbody>
  );
}
