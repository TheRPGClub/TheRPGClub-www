import { requireAuth } from "@/lib/session";
import { appShellProps } from "@/lib/app-shell";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({
  children,
  crumbs,
}: {
  children: React.ReactNode;
  // The @crumbs slot: the current route's trail for the top bar.
  crumbs: React.ReactNode;
}) {
  // An expired or revoked session goes back through sign-in to this page.
  // The shell's reads are sequenced behind the redirect, not run alongside
  // getSession, so a logged-out render never wastes a fetch that can only
  // fail.
  const session = await requireAuth();
  return (
    <AppShell {...await appShellProps(session)} crumbs={crumbs}>
      {children}
    </AppShell>
  );
}
