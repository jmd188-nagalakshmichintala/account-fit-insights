/** Backend API endpoints. Keep every URL the client talks to in one place. */
export const API_ENDPOINTS = {
  currentUser: "/api/me",
  customers: "/api/customers",
  customersGrouped: "/api/customers/all",
  productFitSummary: "/api/customers/product-fit-summary",
  fleetSizeMax: "/api/customers/fleet-size-max",
  deprioritizeAccount: (accountId) =>
    `/api/customers/${accountId}/deprioritize`,
  restoreAccount: (accountId) => `/api/customers/${accountId}/restore`,
  deprioritizedAccounts: "/api/customers/deprioritized",
  accountInfo: "/api/account-panel/account-info",
  contacts: "/api/account-panel/contacts",
  kpis: "/api/account-panel/kpis",
  engagement: "/api/account-panel/engagement",
  accountOwners: "/api/account-owners",
  regions: "/api/regions",
  salesRepProductDistribution: "/api/slt-view/sales-rep-product-distribution",
  SLT_VIEW_SUMMARY: "/api/slt-view/summary",
  scoreDistribution: "/api/slt-view/score-distribution",
  scoreDistributionAccounts: "/api/slt-view/score-distribution/accounts",
  accountDistribution: "/api/slt-view/account-distribution",
  accountDistributionAccounts: "/api/slt-view/account-distribution/accounts",
  accountSummary: "/api/slt-view/account-summary",
  chatMessages: "/api/chat/messages",
  chatSampleQuestions: "/api/chat/sample-questions",
  chatSpaceInfo: "/api/chat/space-info",
  chatConversations: "/api/chat/conversations",
  chatConversation: (conversationId) =>
    `/api/chat/conversations/${conversationId}`,
  chatConversationMessages: (conversationId) =>
    `/api/chat/conversations/${conversationId}/messages`,
  chatQueryResult: (conversationId, messageId, attachmentId) =>
    `/api/chat/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}/query-result`,
  chatDownloadVisualization: (conversationId, messageId, attachmentId) =>
    `/api/chat/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}/download-visualization`,
};

/**
 * React Query cache keys. Functions are used for keys that depend on a param
 * so the cache stays correctly scoped per id.
 */
const DEPRIORITIZED_ACCOUNTS_KEY = ["deprioritized-accounts"];

export const QUERY_KEYS = {
  currentUser: ["current-user"],
  customers: ["customers"],
  customersGrouped: ["customers-grouped"],
  productFitSummary: ["product-fit-summary"],
  deprioritizeAccount: ["deprioritize-account"],
  restoreAccount: ["restore-account"],
  // Prefix, for invalidating/matching every cached variant regardless of accountName.
  deprioritizedAccountsPrefix: DEPRIORITIZED_ACCOUNTS_KEY,
  deprioritizedAccounts: (accountName) => [
    ...DEPRIORITIZED_ACCOUNTS_KEY,
    accountName,
  ],
  accountInfo: (accountId) => ["account-info", accountId],
  contacts: (accountId) => ["contacts", accountId],
  kpis: (accountId) => ["kpis", accountId],
  engagement: (accountId) => ["engagement", accountId],
  accountOwners: ["account-owners"],
  fleetSizeMax: ["fleet-size-max"],
  regions: ["regions"],
  sltViewSummary: ["slt-view-summary"],
  salesRepProductDistribution: (filters) => [
    "sales-rep-product-distribution",
    filters,
  ],
  scoreDistribution: (filters) => ["score-distribution", filters],
  scoreDistributionAccounts: (params) => [
    "score-distribution-accounts",
    params,
  ],
  accountDistribution: (filters) => ["account-distribution", filters],
  accountDistributionAccounts: (params) => [
    "account-distribution-accounts",
    params,
  ],
  accountSummary: (filters) => ["account-summary", filters],
  chatMessages: (conversationId) => ["chat-messages", conversationId],
  chatQueryResult: (conversationId, messageId, attachmentId) => [
    "chat-query-result",
    conversationId,
    messageId,
    attachmentId,
  ],
  chatVisualization: (conversationId, messageId, attachmentId) => [
    "chat-visualization",
    conversationId,
    messageId,
    attachmentId,
  ],
  chatSampleQuestions: ["chat-sample-questions"],
  chatSpaceInfo: ["chat-space-info"],
  chatConversations: ["chat-conversations"],
};

/** Number of rows requested per infinite-scroll page. */
export const DEFAULT_PAGE_SIZE = 20;

/** `staleTime` presets (ms) so cache freshness is consistent across hooks. */
export const STALE_TIME = {
  short: 2 * 60 * 1000, // 2 minutes
  medium: 5 * 60 * 1000, // 5 minutes
  long: 10 * 60 * 1000, // 10 minutes
};

/** `gcTime` presets (ms) for how long inactive queries stay cached. */
export const GC_TIME = {
  medium: 30 * 60 * 1000, // 30 minutes
  long: 60 * 60 * 1000, // 60 minutes
};
