import {
  fetchProductDistributionBySalesRep,
  fetchProductDistributionByScore,
  fetchSummaryMetrics,
  fetchAccountDistributionBySalesRep,
  fetchAccountSummaryMetrics,
  fetchAccountsForFitBucket,
  fetchAccountsForScoreBucket,
} from "../repositories/sltViewRepository.js";
import { fetchChildAccountsForTopAccounts } from "../repositories/customerRepository.js";
import { fetchUserAccessAndAccounts } from "../repositories/userHierarchyRepository.js";
import { fetchAccountOwnersForUser } from "../repositories/accountOwnerRepository.js";

async function getUserOwnerEmails({ userId, email }) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });

  if (!userAccess.canFilterByOwner) {
    return { ownerEmails: [], hasAccess: false };
  }

  const owners = await fetchAccountOwnersForUser(userAccess.accountIds);

  if (owners.length === 0) {
    return { ownerEmails: [], hasAccess: false };
  }

  return {
    ownerEmails: owners.map((o) => o.owner_email),
    hasAccess: true,
  };
}

export async function getSalesRepProductDistribution(user, filters = {}) {
  const { ownerEmails, hasAccess } = await getUserOwnerEmails(user);

  if (!hasAccess) {
    return {
      salesReps: [],
      distributionData: [],
    };
  }

  const rawData = await fetchProductDistributionBySalesRep(
    ownerEmails,
    filters,
  );

  const salesRepMap = new Map();

  rawData.forEach((row) => {
    const ownerEmail = row.owner_email;

    if (!salesRepMap.has(ownerEmail)) {
      salesRepMap.set(ownerEmail, {
        ownerEmail: row.owner_email,
        ownerName: row.owner_name,
        initials: getInitials(row.owner_name),
        high: 0,
        mid: 0,
        low: 0,
        highArr: 0,
        midArr: 0,
        lowArr: 0,
        highScores: {},
        midScores: {},
        lowScores: {},
        highArrScores: {},
        midArrScores: {},
        lowArrScores: {},
      });
    }

    const rep = salesRepMap.get(ownerEmail);
    const scoreRange = row.score_range;
    const score = row.product_score;
    const count = parseInt(row.product_count, 10);
    const arr = parseFloat(row.total_potential_arr) || 0;

    if (scoreRange === "High") {
      rep.high += count;
      rep.highArr += arr;
      rep.highScores[score] = (rep.highScores[score] || 0) + count;
      rep.highArrScores[score] = (rep.highArrScores[score] || 0) + arr;
    } else if (scoreRange === "Mid") {
      rep.mid += count;
      rep.midArr += arr;
      rep.midScores[score] = (rep.midScores[score] || 0) + count;
      rep.midArrScores[score] = (rep.midArrScores[score] || 0) + arr;
    } else if (scoreRange === "Low") {
      rep.low += count;
      rep.lowArr += arr;
      rep.lowScores[score] = (rep.lowScores[score] || 0) + count;
      rep.lowArrScores[score] = (rep.lowArrScores[score] || 0) + arr;
    }
  });

  const distributionData = Array.from(salesRepMap.values());

  return {
    salesReps: distributionData.map((rep) => ({
      ownerEmail: rep.ownerEmail,
      ownerName: rep.ownerName,
      initials: rep.initials,
    })),
    distributionData,
  };
}

export async function getSummaryMetrics(user, filters = {}) {
  const { ownerEmails, hasAccess } = await getUserOwnerEmails(user);

  if (!hasAccess) {
    return {
      totalProducts: 0,
      totalOpenOpportunities: 0,
      totalPotentialArr: 0,
    };
  }

  const metrics = await fetchSummaryMetrics(ownerEmails, filters);
  return metrics;
}

export async function getScoreDistribution(user, filters = {}) {
  const { ownerEmails, hasAccess } = await getUserOwnerEmails(user);

  if (!hasAccess) {
    return { scoreData: [] };
  }

  const rawData = await fetchProductDistributionByScore(ownerEmails, filters);

  const scoreData = rawData.map((row) => ({
    score: row.product_score,
    productCount: parseInt(row.product_count, 10),
    totalArr: parseFloat(row.total_potential_arr) || 0,
    openProductCount: parseInt(row.open_product_count, 10),
    openArr: parseFloat(row.open_potential_arr) || 0,
  }));

  return { scoreData };
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function getAccountDistributionBySalesRep(user, filters = {}) {
  const { ownerEmails, hasAccess } = await getUserOwnerEmails(user);

  if (!hasAccess) {
    return {
      salesReps: [],
      distributionData: [],
    };
  }

  const rawData = await fetchAccountDistributionBySalesRep(
    ownerEmails,
    filters,
  );

  const salesRepMap = new Map();

  rawData.forEach((row) => {
    const ownerEmail = row.owner_email;

    if (!salesRepMap.has(ownerEmail)) {
      salesRepMap.set(ownerEmail, {
        ownerEmail: row.owner_email,
        ownerName: row.owner_name,
        initials: getInitials(row.owner_name),
        high: 0,
        mid: 0,
        low: 0,
        highArr: 0,
        midArr: 0,
        lowArr: 0,
        highScores: {},
        midScores: {},
        lowScores: {},
      });
    }

    const rep = salesRepMap.get(ownerEmail);
    const scoreRange = row.score_range;
    const actualScore = row.actual_score;
    const accountCount = parseInt(row.account_count, 10);
    const arr = parseFloat(row.total_arr) || 0;

    if (scoreRange === "High") {
      rep.high += accountCount;
      rep.highArr += arr;
      rep.highScores[actualScore] =
        (rep.highScores[actualScore] || 0) + accountCount;
    } else if (scoreRange === "Mid" || scoreRange === "Medium") {
      rep.mid += accountCount;
      rep.midArr += arr;
      rep.midScores[actualScore] =
        (rep.midScores[actualScore] || 0) + accountCount;
    } else if (scoreRange === "Low") {
      rep.low += accountCount;
      rep.lowArr += arr;
      rep.lowScores[actualScore] =
        (rep.lowScores[actualScore] || 0) + accountCount;
    }
  });

  const distributionData = Array.from(salesRepMap.values());

  return {
    salesReps: distributionData.map((rep) => ({
      ownerEmail: rep.ownerEmail,
      ownerName: rep.ownerName,
      initials: rep.initials,
    })),
    distributionData,
  };
}

/**
 * Shared by both drilldown modals: pairs a page of top-level accounts with
 * their real children (same grouped shape as the first tab's table) and the
 * pagination envelope the frontend's usePaginatedData expects.
 */
async function buildGroupedAccountsPage(
  topAccounts,
  totalCount,
  userAccess,
  page,
  pageSize,
) {
  const topAccountIds = topAccounts.map((row) => row.sf_account_id);
  const childRows = await fetchChildAccountsForTopAccounts(topAccountIds, {
    allowedAccountIds: userAccess.accountIds,
  });

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
    childAccounts: childrenByParentId.get(topAccount.sf_account_id) ?? [],
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

// Records behind one bar segment on the "Account Fit by Sales Rep" chart (drilldown modal).
// Grouped the same way as the first tab's table: one item per top-level (parent)
// account plus its real children, so the modal can show the same expandable hierarchy.
export async function getAccountsForFitBucket(
  user,
  filters = {},
  bucket,
  { page = 1, pageSize = 20 } = {},
) {
  const { ownerEmails, hasAccess } = await getUserOwnerEmails(user);

  if (!hasAccess) {
    return {
      items: [],
      totalCount: 0,
      currentPage: page,
      pageSize,
      totalPages: 0,
    };
  }

  const userAccess = await fetchUserAccessAndAccounts(user);
  const offset = (page - 1) * pageSize;
  const { rows: topAccounts, totalCount } = await fetchAccountsForFitBucket(
    ownerEmails,
    filters,
    bucket,
    { limit: pageSize, offset },
  );

  return buildGroupedAccountsPage(
    topAccounts,
    totalCount,
    userAccess,
    page,
    pageSize,
  );
}

// Records behind one score bar (or one of its open/non-open segments) on the
// "Products Across Propensity Scores" chart (drilldown modal).
export async function getAccountsForScoreBucket(
  user,
  filters = {},
  score,
  hasOpenOpp,
  { page = 1, pageSize = 20 } = {},
) {
  const { ownerEmails, hasAccess } = await getUserOwnerEmails(user);

  if (!hasAccess) {
    return {
      items: [],
      totalCount: 0,
      currentPage: page,
      pageSize,
      totalPages: 0,
    };
  }

  const userAccess = await fetchUserAccessAndAccounts(user);
  const offset = (page - 1) * pageSize;
  const { rows: topAccounts, totalCount } = await fetchAccountsForScoreBucket(
    ownerEmails,
    filters,
    score,
    hasOpenOpp,
    { limit: pageSize, offset },
  );

  return buildGroupedAccountsPage(
    topAccounts,
    totalCount,
    userAccess,
    page,
    pageSize,
  );
}

export async function getAccountSummaryMetrics(user, filters = {}) {
  const userAccess = await fetchUserAccessAndAccounts(user);

  if (!userAccess.canFilterByOwner) {
    return {
      totalAccounts: 0,
      totalOpenOpportunities: 0,
      totalPotentialArr: 0,
    };
  }

  const enhancedFilters = {
    ...filters,
    allowedAccountIds: userAccess.accountIds,
  };

  return fetchAccountSummaryMetrics(enhancedFilters);
}
