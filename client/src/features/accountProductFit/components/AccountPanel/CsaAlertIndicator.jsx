import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { CSA_ALERT_STYLES } from "../../constants/accountProductFit.constants";
import { getCsaAlertSeverity } from "../../utils/productFitFormatting.utils";

/**
 * Warning icon shown next to a CSA score when its percentile is near or past
 * its FMCSA intervention threshold. Renders nothing when comfortably clear.
 */
export function CsaAlertIndicator({ percentile, threshold }) {
  const severity = getCsaAlertSeverity(percentile, threshold);
  if (!severity) return null;

  const { icon, message } = CSA_ALERT_STYLES[severity];

  return (
    <Tooltip
      side="top"
      width={220}
      content={<p className="p-2.5 text-xs text-slate-600">{message}</p>}
    >
      <AlertTriangle className={cn("h-3 w-3", icon)} />
    </Tooltip>
  );
}
