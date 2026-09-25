import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

export function Tabs({ tabs, className }) {
  const location = useLocation();

  return (
    <div className={cn("border-b border-border bg-ghost-white", className)}>
      <nav className="flex gap-2 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          const InfoIcon = tab.infoIcon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "relative flex items-center gap-2 border-b-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-dark-blue text-dark-blue"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {InfoIcon && tab.tooltipContent && (
                <Tooltip
                  side="right"
                  width={380}
                  content={
                    <div className="p-3 text-xs text-slate-700">
                      {tab.tooltipContent}
                    </div>
                  }
                >
                  <InfoIcon
                    className="ml-1 h-4 w-4 cursor-pointer text-blue-600"
                    onClick={(e) => e.preventDefault()}
                  />
                </Tooltip>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
