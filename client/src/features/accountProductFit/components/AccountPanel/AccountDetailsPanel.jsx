import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  SIDEBAR_VIEW_IDS,
  SIDEBAR_VIEWS,
} from "../../constants/accountProductFit.constants";
import { useAccountInfo } from "../../hooks/useAccountInfo";
import { AccountDetailsHeader } from "./AccountDetailsHeader";
import { AccountSummary } from "./AccountSummary";
import { CustomerContacts } from "./CustomerContacts";
import { CustomerKpis } from "./CustomerKpis";
import { Engagement } from "./Engagement";
import { AccountPrioritisation } from "./AccountPrioritisation";

const VIEW_COMPONENTS = {
  [SIDEBAR_VIEW_IDS.summary]: AccountSummary,
  [SIDEBAR_VIEW_IDS.contact]: CustomerContacts,
  [SIDEBAR_VIEW_IDS.kpi]: CustomerKpis,
  [SIDEBAR_VIEW_IDS.engagement]: Engagement,
};

export function AccountDetailsPanel({ account, onClose }) {
  const [view, setView] = useState(SIDEBAR_VIEW_IDS.summary);
  const ActiveView = VIEW_COMPONENTS[view];
  const { data: accountInfo } = useAccountInfo(account?.id);

  return (
    <div className="space-y-4">
      <AccountDetailsHeader account={account} accountInfo={accountInfo} />

      <Dropdown
        options={SIDEBAR_VIEWS}
        value={view}
        onChange={setView}
        allowClear={false}
      />

      <ActiveView account={account} />

      <AccountPrioritisation account={account} onClose={onClose} />
    </div>
  );
}
