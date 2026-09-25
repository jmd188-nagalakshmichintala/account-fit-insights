import { cn } from "@/lib/utils";
import { ACCOUNT_FIT_STYLES } from "../../constants/accountProductFit.constants";

export function AccountFitCell({ fit }) {
  if (fit == null) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex min-w-20 justify-center rounded-full border px-3 py-1 text-xs font-medium",
        ACCOUNT_FIT_STYLES[fit],
      )}
    >
      {fit}
    </span>
  );
}
