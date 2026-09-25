import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/services/apiClient";
import { API_ENDPOINTS, QUERY_KEYS } from "@/constants/api.constants";
import { useToast } from "@/contexts/ToastContext";

/**
 * Mutation hook to restore a deprioritized account with optimistic updates.
 * Immediately removes from deprioritized table, then performs backend operation.
 * On success, invalidates customers list to show the restored account.
 */
export function useRestoreAccount() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationKey: QUERY_KEYS.restoreAccount,
    mutationFn: async ({ accountId }) => {
      return fetchJson(API_ENDPOINTS.restoreAccount(accountId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onMutate: async (variables) => {
      const { accountId } = variables;

      showToast("Restoring account...", "info", 2000);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });

      const previousDeprioritized = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.deprioritizedAccountsPrefix },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((item) => {
            if (item.sf_account_id === accountId) return false;
            return !(
              item.has_parent === true &&
              item.ultimate_parent_id_c === accountId
            );
          });
        },
      );

      return { previousDeprioritized };
    },
    onError: (error) => {
      // Rollback by invalidating - forces refetch from server
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });

      showToast(
        error?.message || "Failed to restore account. Please try again.",
        "error",
      );
    },
    onSuccess: () => {
      // Invalidate the grouped customers list to show the restored account.
      // Not attempted optimistically: reinserting a row would mean rebuilding
      // its full grouped position (which page/group/sort slot it belongs in)
      // from just the mutation payload, so a plain refetch is the safe choice
      // here, same as before this account used the grouped endpoint.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customersGrouped });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productFitSummary });

      showToast("Account successfully restored", "success");
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.deprioritizedAccountsPrefix,
      });
    },
  });
}
