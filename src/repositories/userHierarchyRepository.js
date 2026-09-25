// Every authenticated user gets full, unrestricted access — this app has no
// per-user/role data scoping. `accountIds: null` is the existing "unrestricted"
// contract every consumer (customerRepository, sltViewRepository, etc.)
// already understands.
export async function fetchUserAccessAndAccounts() {
  return {
    accountIds: null,
    canFilterByOwner: true,
    accessLevel: "full-access",
  };
}
