import { fetchAccountOwnersForUser } from "../repositories/accountOwnerRepository.js";
import { fetchUserAccessAndAccounts } from "../repositories/userHierarchyRepository.js";

export async function getAccountOwners({ userId, email }) {
  const userAccess = await fetchUserAccessAndAccounts({ userId, email });

  if (!userAccess.canFilterByOwner) {
    return [];
  }

  return await fetchAccountOwnersForUser(userAccess.accountIds);
}
