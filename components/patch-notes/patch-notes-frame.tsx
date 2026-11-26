import type { ReactNode } from "react";

import type { AppSession } from "@/lib/auth-types";
import { appShellProps } from "@/lib/app-shell";
import { discordInviteUrl } from "@/lib/discord-invite";
import { discordSignInUrl } from "@/lib/sign-in";
import { PublicFrame } from "@/components/landing/public-frame";
import { AppShell } from "@/components/shell/app-shell";

// Read when the module loads, as /join does: no dead Join the Discord.
const INVITE = discordInviteUrl();

// Patch Notes' frame (www#236), as Club History's: a Visitor gets the public
// top bar, with sign-in coming back to this page; a Member the app shell.
export async function PatchNotesFrame({
  session,
  path,
  children,
}: {
  session: AppSession | null;
  path: string;
  children: ReactNode;
}) {
  if (!session) {
    return (
      <PublicFrame current={path} signInHref={discordSignInUrl(path)} inviteHref={INVITE}>
        {children}
      </PublicFrame>
    );
  }
  return <AppShell {...await appShellProps(session)}>{children}</AppShell>;
}
