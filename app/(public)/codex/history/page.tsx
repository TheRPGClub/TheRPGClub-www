import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchHistoryEvents } from "@/lib/api/codex";
import { appShellProps } from "@/lib/app-shell";
import { historyQuery } from "@/lib/codex/history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { crumbTrail } from "@/lib/crumbs";
import { discordInviteUrl } from "@/lib/discord-invite";
import { featureView } from "@/lib/features";
import { firstParam } from "@/lib/search-params";
import { getSession } from "@/lib/session";
import { discordSignInUrl } from "@/lib/sign-in";
import { isAdminOrAbove } from "@/lib/staff";
import { RunningHead } from "@/components/issue/running-head";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PublicFrame } from "@/components/landing/public-frame";
import { AppShell } from "@/components/shell/app-shell";
import { HistoryTimeline } from "@/components/codex/history/history-timeline";

// Club History (www#126, design 2B), the public part of the Club Codex. It
// lives outside the protected group so a Visitor can read it, and serves
// both frames itself: a Visitor gets the public top bar, a Member the app
// shell with its crumbs. The API decides what a Visitor sees (not found
// unless the Feature is Live); a Member's session decides theirs, as on
// every Feature page.

// Read when the module loads, as /join does: no dead Join the Discord.
const INVITE = discordInviteUrl();

export const metadata: Metadata = { title: "Club History · The RPG Club" };

export default async function ClubHistoryPage({ searchParams }: PageProps<"/codex/history">) {
  const [params, session] = await Promise.all([searchParams, getSession()]);
  const features = featureView(session?.features);
  if (session && !features.canOpen("club_codex")) notFound();
  const events = await fetchHistoryEvents();
  if (events === "not_found") notFound();

  const query = historyQuery({
    kind: firstParam(params.kind),
    order: firstParam(params.order),
    page: firstParam(params.page),
  });
  const timeline = (
    <HistoryTimeline
      events={events}
      query={query}
      linked={session !== null}
      canAdd={isAdminOrAbove(session?.membership)}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );

  if (!session) {
    return (
      <PublicFrame current={HISTORY_PATH} signInHref={discordSignInUrl(HISTORY_PATH)} inviteHref={INVITE}>
        {timeline}
      </PublicFrame>
    );
  }
  const trail = await crumbTrail(["codex", "history"]);
  return (
    <AppShell {...await appShellProps(session)} crumbs={<RunningHead trail={trail} />}>
      {timeline}
    </AppShell>
  );
}
