import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchCurrentPhase } from "@/lib/api/voting-round";
import { fetchCurrentGotmRound } from "@/lib/api/gotm-rounds";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/issue/top-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
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
  //
  // The current round names the running head's issue; it's the same cached
  // read the dashboard makes, so the two never disagree.
  const [votingPhase, currentRound] = await Promise.all([
    fetchCurrentPhase(),
    fetchCurrentGotmRound(),
  ]);
  const issueMonth =
    currentRound?.gotm?.month_year ?? currentRound?.nr_gotm?.month_year;
  const issue =
    currentRound && issueMonth
      ? { roundNumber: currentRound.round_number, monthYear: issueMonth }
      : null;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          principal={session.principal}
          membership={session.membership}
          votingPhase={votingPhase}
        />
        <SidebarInset>
          <TopBar issue={issue} />
          <div className="flex flex-1 flex-col px-4 py-6 sm:px-7">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
