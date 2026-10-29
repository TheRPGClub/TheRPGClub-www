import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchCurrentPhase } from "@/lib/api/voting-round";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/issue/top-bar";

export default async function AppLayout({
  children,
  crumbs,
}: {
  children: React.ReactNode;
  // The @crumbs slot: the current route's trail for the top bar.
  crumbs: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  // Sequenced behind the redirect, not run alongside getSession.
  //
  // voting_rounds/current requires auth and 401s without it. Next's Data
  // Cache key includes the request headers (and so the member's
  // Authorization), so cached reads are per member and a 401 is never shared;
  // waiting for the session only keeps a logged-out render from wasting a
  // fetch that can only fail.
  const votingPhase = await fetchCurrentPhase();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          principal={session.principal}
          membership={session.membership}
          votingPhase={votingPhase}
        />
        {/* min-w-0: a wide scroll row (a shelf) must scroll inside the page,
            not widen the column past the window. */}
        <SidebarInset className="min-w-0">
          <TopBar trail={crumbs} />
          <div className="flex flex-1 flex-col px-4 py-6 sm:px-7">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
