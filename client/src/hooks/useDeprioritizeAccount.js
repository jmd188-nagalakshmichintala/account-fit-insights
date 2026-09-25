import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/services/apiClient";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";
import { useToast } from "@/contexts/ToastContext";

/**
 * Mutation hook to deprioritize an account with optimistic updates.
 * Immediately updates both tables in the UI, then performs the backend operation.
 * If the operation fails, rolls back the changes by invalidating queries.
 */
export function useDeprioritizeAccount() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationKey: QUERY_KEYS.deprioritizeAccount,
    mutationFn: async ({ accountId, ...data }) => {
      return fetchJson(API_ENDPOINTS.deprioritizeAccount(accountId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onMutate: async (variables) => {
      const {
        accountId,
        accountName,
        fleetSize,
        accountFit,
        operationType,
        ownerId,
        reason,
        deprioritizedBy,
      } = variables;

      showToast("Deprioritizing account...", "info", 2000);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.customersGrouped,
      });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });

      // Snapshot the previous values for rollback
      const previousCustomers = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.customersGrouped,
      });
      const previousDeprioritized = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });

      // Optimistically remove from the grouped customers table: drop the
      // whole group if the topAccount is deprioritized, or just the matching child.
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.customersGrouped },
        (oldData) => {
          if (!oldData?.items) return oldData;

          return {
            ...oldData,
            items: oldData.items
              .filter((item) => item.topAccount.sf_account_id !== accountId)
              .map((item) => ({
                ...item,
                childAccounts: item.childAccounts.filter(
                  (child) => child.sf_account_id !== accountId,
                ),
              })),
          };
        },
      );

      // Only splice into cached search variants that match this account (DB column is account_tier but stores account_fit)
      const newEntry = {
        sf_account_id: accountId,
        sf_account_name: accountName,
        fleet_size: fleetSize,
        account_tier: accountFit,
        operation_type: operationType,
        owner_id: ownerId,
        reason: reason,
        deprioritized_at: new Date().toISOString(),
        deprioritized_by: deprioritizedBy,
      };

      queryClient
        .getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.deprioritizedAccountsPrefix })
        .forEach(({ queryKey }) => {
          const [, searchTerm] = queryKey;
          const matchesSearch =
            !searchTerm ||
            accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            accountId === searchTerm;
          if (!matchesSearch) return;

          queryClient.setQueryData(queryKey, (oldData) =>
            oldData ? [newEntry, ...oldData] : [newEntry],
          );
        });

      // Return context with snapshots for potential rollback
      return { previousCustomers, previousDeprioritized };
    },
    onError: (error) => {
      // Rollback by invalidating queries - forces a refetch from server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customersGrouped });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productFitSummary });

      showToast(
        error?.message || "Failed to deprioritize account. Please try again.",
        "error",
      );
    },
    onSuccess: () => {
      // Invalidate summary to update counts
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productFitSummary });

      showToast("Account successfully deprioritized", "success");
    },
    onSettled: () => {
      // Always refetch to ensure consistency with server state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customersGrouped });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });
    },
  });
}
