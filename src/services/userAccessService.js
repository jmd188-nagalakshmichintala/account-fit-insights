import { fetchUserAccessAndAccounts } from "../repositories/userHierarchyRepository.js";

const SLT_VIEW_ACCESS_LEVELS = new Set([
  "full-access",
  "manager-user",
  "manager-only",
]);

export async function getAccessSummary({ userId, email }) {
  const { accessLevel } = await fetchUserAccessAndAccounts({ userId, email });

  return {
    accessLevel,
    hasSltViewAccess: SLT_VIEW_ACCESS_LEVELS.has(accessLevel),
  };
}
