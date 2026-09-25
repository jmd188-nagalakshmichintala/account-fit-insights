import { fetchRegionsForUser } from "../repositories/regionRepository.js";
import { fetchUserAccessAndAccounts } from "../repositories/userHierarchyRepository.js";

export async function getRegions({ userId, email }) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });
  return await fetchRegionsForUser(userAccess.accountIds);
}
