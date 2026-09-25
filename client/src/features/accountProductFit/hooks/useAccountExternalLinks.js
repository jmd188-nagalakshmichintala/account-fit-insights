import useCurrentUser from "@/hooks/useCurrentUser";

/** Builds the Gong/FMCSA links for an account. */
export function useAccountExternalLinks(account, accountInfo) {
  const user = useCurrentUser();

  const gongUrl = `${user?.gongBaseUrl}/go/account?crm-id=${account?.id}&crm-object-type=account`;
  const fmcsaUrl = accountInfo?.usdot_number
    ? `https://safer.fmcsa.dot.gov/query.asp?query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${accountInfo.usdot_number}`
    : null;

  const handleGongClick = () => {
    window.open(gongUrl, "gong");
  };

  const handleFmcsaClick = () => {
    window.open(fmcsaUrl, "fmcsa");
  };

  return { fmcsaUrl, handleGongClick, handleFmcsaClick };
}
