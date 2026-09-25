import { useState } from "react";
import { AlertTriangle, UserMinus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Radio } from "@/components/ui/Radio";
import { useDeprioritizeAccount } from "@/hooks/useDeprioritizeAccount";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useAccountInfo } from "../../hooks/useAccountInfo";
import { DEPRIORITIZE_REASONS } from "../../constants/dePrioritizedAccounts.constants";

export function AccountPrioritisation({ account, onClose }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [submitError, setSubmitError] = useState("");
  const currentUser = useCurrentUser();
  const deprioritizeMutation = useDeprioritizeAccount();
  const { data: accountInfo } = useAccountInfo(account?.id);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReason("");
    setSubmitError("");
  };

  const handleProceed = async () => {
    if (!selectedReason || !currentUser) return;

    try {
      setSubmitError("");
      await deprioritizeMutation.mutateAsync({
        accountId: account.id,
        accountName: account.account,
        fleetSize: account.fleetSize,
        accountFit: account.accountFit,
        operationType: accountInfo?.operation_type,
        ownerId: currentUser.userId,
        reason: selectedReason,
        deprioritizedBy: currentUser.fullName,
      });

      handleCloseModal();
      onClose?.();
    } catch (error) {
      console.error("Failed to deprioritize account:", error);
      setSubmitError(
        error?.message ||
          "Failed to deprioritize this account. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <h4 className="text-sm font-semibold text-foreground">Prioritization</h4>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full cursor-pointer rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        disabled={deprioritizeMutation.isPending}
      >
        <span className="inline-flex items-center justify-center gap-1.5">
          <UserMinus className="h-4 w-4" />
          Deprioritize this account
        </span>
      </button>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Deprioritize account"
        maxWidth={480}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md bg-amber-50 border border-amber-200 p-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              Please select a reason for deprioritizing{" "}
              <strong>{account?.account}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for deprioritization
            </label>
            <Radio
              name="deprioritize-reason"
              options={DEPRIORITIZE_REASONS}
              value={selectedReason}
              onChange={setSelectedReason}
              orientation="vertical"
              aria-label="Select reason for deprioritization"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={!selectedReason || deprioritizeMutation.isPending}
              className="flex-1 cursor-pointer rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deprioritizeMutation.isPending ? "Processing..." : "Proceed"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
