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
  // Cached, so the sidebar's phase badge costs every page in the app a Data
  // Cache hit rather than an API round-trip. Runs alongside the session read.
  const [session, votingPhase] = await Promise.all([
    getSession(),
    fetchCurrentPhase(),
  ]);
  if (!session) redirect("/");

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
