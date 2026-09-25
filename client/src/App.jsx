import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LayoutGrid, BarChart3, Info } from "lucide-react";
import { AccountProductFitPage } from "@/features/accountProductFit/AccountProductFitPage";
import { SltViewPage } from "@/features/sltView/SltViewPage";
import { AppHeader } from "@/components/layout/AppHeader";
import { Tabs } from "@/components/ui/Tabs";
import { ChatWidget } from "@/features/chatWidget/ChatWidget";
import useCurrentUser from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "react-error-boundary";

const TABS = [
  {
    label: "Account product fit scores",
    path: "/",
    icon: LayoutGrid,
    infoIcon: Info,
    tooltipContent:
      "Fit scores (compliance asset, compliance driver, safety+) open detailed rules analysis. Any other column, including the account name, opens account details in the side panel — hover a score to see the fit reasoning.",
  },
  {
    label: "SLT view",
    path: "/slt-view",
    icon: BarChart3,
  },
];

export default function App() {
  const user = useCurrentUser();
  const [chatOpen, setChatOpen] = useState(false);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);

  const hasSltViewAccess = user?.hasSltViewAccess ?? false;
  const visibleTabs = hasSltViewAccess
    ? TABS
    : TABS.filter((tab) => tab.path !== "/slt-view");

  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col overflow-hidden bg-ghost-white text-foreground">
        <ChatWidget
          onOpenChange={setChatOpen}
          accountPanelOpen={accountPanelOpen}
        />

        <div className="shrink-0">
          <AppHeader user={user} />
          <Tabs tabs={visibleTabs} />
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-200",
            chatOpen && "mr-[520px]",
          )}
        >
          <ErrorBoundary
            fallback={
              <div className="p-6 text-center">
                Something went wrong. Please refresh the page.
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  <AccountProductFitPage
                    chatOpen={chatOpen}
                    onAccountPanelOpenChange={setAccountPanelOpen}
                  />
                }
              />
              <Route
                path="/slt-view"
                element={
                  user === null ? null : hasSltViewAccess ? (
                    <SltViewPage />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </BrowserRouter>
  );
}
