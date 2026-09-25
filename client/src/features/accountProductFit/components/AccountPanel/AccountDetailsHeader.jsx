import {
  Building2,
  MapPin,
  User,
  Phone,
  ExternalLink,
  Hash,
} from "lucide-react";
import { useAccountExternalLinks } from "../../hooks/useAccountExternalLinks";

export function AccountDetailsHeader({ account, accountInfo }) {
  const { fmcsaUrl, handleGongClick, handleFmcsaClick } =
    useAccountExternalLinks(account, accountInfo);

  return (
    <div className="space-y-3 border-b border-border pb-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-blue/10">
          <Building2 className="h-5 w-5 text-dark-blue" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {account?.account ?? "—"}
          </h3>
          {accountInfo && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {(accountInfo.city || accountInfo.state) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {[accountInfo.city, accountInfo.state]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {accountInfo.owner_name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>{accountInfo.owner_name}</span>
                </div>
              )}
              {accountInfo.salesforce_account_id && (
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span>{accountInfo.salesforce_account_id}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {accountInfo && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-muted-foreground">
            Take action here:
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGongClick}
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-md bg-purple-50 px-2.5 py-3 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>Link to Gong</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            {fmcsaUrl && (
              <button
                type="button"
                onClick={handleFmcsaClick}
                className="inline-flex items-center gap-1.5 cursor-pointer rounded-md bg-green-50 px-2.5 py-3 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
              >
                <span>FMCSA - USDOT {accountInfo.usdot_number}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
