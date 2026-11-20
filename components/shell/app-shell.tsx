import type { SessionMembership, SessionPrincipal } from "@/lib/auth-types";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { SessionFeature } from "@/lib/features";
import type { PinRules } from "@/lib/pinned-pages";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { TopBar } from "@/components/issue/top-bar";
import { AccountMenu } from "@/components/shell/account-menu";
import { TabBar } from "@/components/shell/tab-bar";

// The signed-in site's frame: the sidebar beside the page, the top bar with
// the route's trail over it, and the content frame that owns page width. On
// phones the tab bar and the top bar's account menu stand in for the
// sidebar.
export function AppShell({
  principal,
  membership,
  votingPhase,
  features,
  sidebarOpen,
  pinnedPages,
  pinRules,
  crumbs,
  children,
}: {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
  votingPhase: VotingPhase | null;
  features: SessionFeature[] | undefined;
  // Expanded or collapsed to the icon rail, from the member's cookie.
  sidebarOpen: boolean;
  // The session's Pinned Pages; undefined before the API sends them.
  pinnedPages?: string[];
  // The session's Pinned Pages limit, room and club default.
  pinRules: PinRules;
  // The current route's trail for the top bar.
  crumbs: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar
          principal={principal}
          membership={membership}
          votingPhase={votingPhase}
          features={features}
          pinnedPages={pinnedPages}
          pinRules={pinRules}
        />
        {/* min-w-0: a wide scroll row (a shelf) must scroll inside the page,
            not widen the column past the window. @container: the bleed
            utility measures this inset to break banners out of the frame. */}
        <SidebarInset className="@container min-w-0">
          <TopBar
            trail={crumbs}
            account={<AccountMenu principal={principal} membership={membership} features={features} />}
          />
          {/* The content frame owns page width: it spans beside the sidebar up
              to max-w-page and centers past it. On phones its foot clears
              the tab bar. */}
          <div className="mx-auto flex w-full max-w-page flex-1 flex-col px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-7 md:pb-6">
            {children}
          </div>
        </SidebarInset>
        <TabBar membership={membership} votingPhase={votingPhase} features={features} />
      </SidebarProvider>
    </TooltipProvider>
  );
}
