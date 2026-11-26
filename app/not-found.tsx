import type { Metadata } from "next";
import { headers } from "next/headers";
import { appShellProps } from "@/lib/app-shell";
import { discordInviteUrl } from "@/lib/discord-invite";
import { featureView } from "@/lib/features";
import { jumpLines } from "@/lib/misprint";
import { getSession } from "@/lib/session";
import { discordSignInUrl, RETURN_TO_HEADER } from "@/lib/sign-in";
import { PublicFrame } from "@/components/landing/public-frame";
import { NotFoundView } from "@/components/misprint/not-found-view";
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = { title: "Page not found · The RPG Club" };

// An address no route matches, and a public page that calls notFound()
// (Club History while the Club Codex isn't Live). A signed-in page's
// notFound() has its own, inside the shell: app/(protected)/not-found.tsx.
// This one frames itself, as Club History does: a Member gets the app
// shell, a Visitor the public top bar. The proxy names a Member's page in
// a header; a Visitor only lands here on a public address, which it
// doesn't name.
export default async function NotFound() {
  const [session, head] = await Promise.all([getSession(), headers()]);
  const address = head.get(RETURN_TO_HEADER);

  if (!session) {
    return (
      <PublicFrame current="" signInHref={discordSignInUrl("/")} inviteHref={discordInviteUrl()}>
        <NotFoundView address={address} jumps={jumpLines("visitor")} />
      </PublicFrame>
    );
  }
  return (
    <AppShell {...await appShellProps(session)}>
      <NotFoundView address={address} jumps={jumpLines("member", featureView(session.features))} />
    </AppShell>
  );
}
