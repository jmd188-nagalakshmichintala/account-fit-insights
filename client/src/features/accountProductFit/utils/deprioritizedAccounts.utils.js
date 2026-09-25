/** Groups flat deprioritized rows into { topAccount, childAccounts } like the main table. */
export function groupDeprioritizedAccounts(rows = []) {
  const idSet = new Set(rows.map((row) => row.sf_account_id));
  const childrenByParent = new Map();
  const topRows = [];

  for (const row of rows) {
    const isChild =
      row.has_parent === true &&
      row.ultimate_parent_id_c &&
      row.ultimate_parent_id_c !== row.sf_account_id &&
      idSet.has(row.ultimate_parent_id_c);

    if (isChild) {
      const siblings = childrenByParent.get(row.ultimate_parent_id_c) ?? [];
      siblings.push(row);
      childrenByParent.set(row.ultimate_parent_id_c, siblings);
    } else {
      topRows.push(row);
    }
  }

  return topRows.map((topAccount) => ({
    topAccount,
    childAccounts: childrenByParent.get(topAccount.sf_account_id) ?? [],
  }));
}
