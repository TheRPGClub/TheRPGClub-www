import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchPublicWinners } from "@/lib/api/public-winners";
import { discordInviteUrl } from "@/lib/discord-invite";
import { firstParam } from "@/lib/search-params";
import { JOIN_RETRY_COOKIE, joinContinuePath } from "@/lib/sign-in";
import { JoinView } from "@/components/join/join-view";

// /join: where Discord sign-in sends a Visitor who is not in the club's
// Discord server (the API adds the return-to). The club's cover keeps running
// on the left while the way in stays pinned on the right: open the invite,
// then Continue, which restarts sign-in with the same return-to.

// Read when the module loads, so a build or server without the setting fails
// instead of rendering a dead invite button.
const INVITE = discordInviteUrl();

export const metadata: Metadata = { title: "Join The RPG Club" };

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const [params, jar, winners] = await Promise.all([searchParams, cookies(), fetchPublicWinners()]);

  return (
    <JoinView
      winners={winners}
      invite={INVITE}
      continueHref={joinContinuePath(firstParam(params.return_to))}
      secondTry={jar.has(JOIN_RETRY_COOKIE)}
    />
  );
}
