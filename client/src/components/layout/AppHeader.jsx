import { cn } from "@/lib/utils";
import { getUserDisplayName, getUserInitials } from "@/lib/user";
import jmanFullLogo from "@/assets/images/jman_full_logo.png";

export function AppHeader({ user, className }) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <header
      className={cn(
        "border-b border-white/10 bg-pale-lavendar-blue text-white",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={jmanFullLogo} alt="JMAN Group" className="h-12 w-auto" />
          <span className="text-sm font-semibold tracking-wide text-dark-blue">
            Account Fit Insights
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <p className="text-xs text-dark-blue/80">
            Welcome,{" "}
            <span className="font-semibold text-dark-blue">{displayName}</span>
          </p>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dark-blue text-xs font-semibold text-white"
            aria-label={displayName}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
