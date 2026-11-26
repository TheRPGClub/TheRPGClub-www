import type { SessionMembership, SessionPrincipal } from "@/lib/auth-types";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { SessionFeature } from "@/lib/features";
import type { PatchSeen } from "@/lib/patch-notes/patch-mark";
import type { PinRules } from "@/lib/pinned-pages";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AccountMenu } from "@/components/shell/account-menu";
import { TabBar } from "@/components/shell/tab-bar";

// The signed-in site's frame: the sidebar beside the page and the content
// frame that owns page width. There is no top bar (www#164): each page's
// heading says where you are, and a nested page's BackLink leads to its
// parent. On phones the tab bar, its last tab the account menu, stands in
// for the sidebar.
export function AppShell({
  principal,
  membership,
  votingPhase,
  features,
  sidebarOpen,
  pinnedPages,
  pinRules,
  patchSeen,
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
  // The session's Patch Mark, for the NEW mark on Patch Notes.
  patchSeen?: PatchSeen;
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
          patchSeen={patchSeen}
        />
        {/* min-w-0: a wide scroll row (a shelf) must scroll inside the page,
            not widen the column past the window. @container: the bleed
            utility measures this inset to break banners out of the frame. */}
        <SidebarInset className="@container min-w-0">
          {/* The content frame owns page width: it spans beside the sidebar up
              to max-w-page and centers past it. Its head clears a phone's
              notch (viewportFit "cover"); on phones its foot clears the tab
              bar. */}
          <div className="mx-auto flex w-full max-w-page flex-1 flex-col px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-7 md:pb-6">
            {children}
          </div>
        </SidebarInset>
        <TabBar
          membership={membership}
          votingPhase={votingPhase}
          features={features}
          patchSeen={patchSeen}
          account={<AccountMenu principal={principal} membership={membership} features={features} />}
        />
      </SidebarProvider>
    </TooltipProvider>
  );
}
