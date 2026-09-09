import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchCurrentPhase } from "@/lib/api/voting-round";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  // Sequenced behind the redirect, NOT run alongside getSession.
  //
  // fetchCurrentPhase is cached and Next keys the Data Cache on URL alone, not
  // on headers, so one entry is shared by every caller. voting_info/current
  // requires auth and 401s without it — so issuing this in parallel let any
  // unauthenticated hit on an (app) route (a crawler, a prefetch, a logged-out
  // visit) cache a 401 for the full revalidate window and blank the phase for
  // every signed-in user behind it, which is how the nav read "Voting" during
  // a nomination window. Past the redirect only authenticated requests can
  // populate it, and the body they get is the same global round metadata for
  // everyone. The serialisation only costs a cache miss.
  const votingPhase = await fetchCurrentPhase();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          principal={session.principal}
          membership={session.membership}
          votingPhase={votingPhase}
        />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
