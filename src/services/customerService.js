import { ID_COLUMN, resolveSortColumn } from "../config.js";
import { encodeCursor } from "../utils/cursor.js";
import {
  fetchCustomers,
  fetchCustomersPaginated,
  fetchCustomersCount,
  fetchProductFitSummary,
  fetchMaxFleetSize,
  deprioritizeAccount,
  fetchDeprioritizedAccounts,
  restoreAccount,
  fetchTopAccountsPaginated,
  fetchTopAccountsCount,
  fetchChildAccountsForTopAccounts,
} from "../repositories/customerRepository.js";
import { fetchUserAccessAndAccounts } from "../repositories/userHierarchyRepository.js";

export async function getCustomersPage({
  pageSize,
  cursor,
  sortBy,
  sortOrder,
  filters,
  userId,
  email,
  parentId,
}) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });

  const enhancedFilters = {
    ...filters,
    allowedAccountIds: userAccess.accountIds,
    parentId,
  };

  const rows = await fetchCustomers({
    pageSize: pageSize + 1,
    cursor,
    sortBy,
    sortOrder,
    filters: enhancedFilters,
  });

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  let nextCursor = null;
  if (hasMore) {
    const lastRow = items[items.length - 1];

    const sortColumn = sortBy ? resolveSortColumn(sortBy) : "compliance_driver";

    nextCursor =
      sortColumn === "potential_arr"
        ? encodeCursor({
            sortValue: lastRow[sortColumn] ?? "",
            id: lastRow[ID_COLUMN],
          })
        : encodeCursor({
            sortValue: lastRow[sortColumn] ?? "",
            sortValue2: lastRow.potential_arr ?? "",
            id: lastRow[ID_COLUMN],
          });
  }

  return {
    items,
    nextCursor,
    hasMore,
    canFilterByOwner: userAccess.canFilterByOwner,
    accessLevel: userAccess.accessLevel,
  };
}

export async function getProductFitSummary({ filters, userId, email } = {}) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });

  const enhancedFilters = {
    ...filters,
    allowedAccountIds: userAccess.accountIds,
  };

  return fetchProductFitSummary({ filters: enhancedFilters });
}

export async function getCustomersPagePaginated({
  page,
  pageSize,
  sortBy,
  sortOrder,
  filters,
  userId,
  email,
  parentId,
}) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });

  const enhancedFilters = {
    ...filters,
    allowedAccountIds: userAccess.accountIds,
    parentId,
  };

  const offset = (page - 1) * pageSize;

  const [items, totalCount] = await Promise.all([
    fetchCustomersPaginated({
      limit: pageSize,
      offset,
      sortBy,
      sortOrder,
      filters: enhancedFilters,
    }),
    fetchCustomersCount({ filters: enhancedFilters }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    currentPage: page,
    pageSize,
    totalPages,
    canFilterByOwner: userAccess.canFilterByOwner,
    accessLevel: userAccess.accessLevel,
  };
}

/**
 * Grouped (parent + children) view of the customers list, for
 * `GET /api/customers/all`. Each returned item is one topAccount group — a
 * topAccount plus every real (non-orphan) child account under it — and
 * pagination counts groups, not flat rows.
 */
export async function getGroupedCustomersPage({
  page,
  pageSize,
  sortBy,
  sortOrder,
  filters,
  userId,
  email,
}) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });

  const enhancedFilters = {
    ...filters,
    allowedAccountIds: userAccess.accountIds,
  };

  const offset = (page - 1) * pageSize;

  const [topAccounts, totalCount] = await Promise.all([
    fetchTopAccountsPaginated({
      limit: pageSize,
      offset,
      sortBy,
      sortOrder,
      filters: enhancedFilters,
    }),
    fetchTopAccountsCount({ filters: enhancedFilters }),
  ]);

  const topAccountIds = topAccounts.map((row) => row[ID_COLUMN]);
  const childRows = await fetchChildAccountsForTopAccounts(
    topAccountIds,
    enhancedFilters,
  );

  const childrenByParentId = new Map();
  for (const child of childRows) {
    const parentId = child.ultimate_parent_id_c;
    if (!childrenByParentId.has(parentId)) {
      childrenByParentId.set(parentId, []);
    }
    childrenByParentId.get(parentId).push(child);
  }

  const items = topAccounts.map((topAccount) => ({
    topAccount,
    childAccounts: childrenByParentId.get(topAccount[ID_COLUMN]) ?? [],
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    currentPage: page,
    pageSize,
    totalPages,
    canFilterByOwner: userAccess.canFilterByOwner,
    accessLevel: userAccess.accessLevel,
  };
}

export async function getMaxFleetSize() {
  return fetchMaxFleetSize();
}

export async function deprioritizeCustomerAccount(accountData) {
  return deprioritizeAccount(accountData);
}

export async function getDeprioritizedAccounts({ userId, email, accountName }) {
  return fetchDeprioritizedAccounts({ userId, email, accountName });
}

export async function restoreCustomerAccount(accountData) {
  return restoreAccount(accountData);
}
