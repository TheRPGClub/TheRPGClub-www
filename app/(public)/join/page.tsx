import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchPublicWinners } from "@/lib/api/public-winners";
import { discordInviteUrl } from "@/lib/discord-invite";
import { firstParam } from "@/lib/search-params";
import { JOIN_RETRY_COOKIE, joinContinuePath } from "@/lib/sign-in";
import { JoinMasthead } from "@/components/join/join-masthead";
import { JoinPanel } from "@/components/join/join-panel";
import { joinSlides } from "@/components/join/join-slides";
import { JoinSlideshow } from "@/components/join/join-slideshow";
import { cn } from "@/lib/utils";

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
  const secondTry = jar.has(JOIN_RETRY_COOKIE);

  return (
    <main className="relative isolate min-h-svh bg-background pb-10 text-foreground lg:min-h-[max(100svh,47rem)] lg:pb-0">
      <JoinMasthead />
      <JoinSlideshow
        slides={joinSlides(winners)}
        className="h-[max(60svh,28rem)] lg:absolute lg:inset-0 lg:h-auto"
      />
      <JoinPanel
        invite={INVITE}
        continueHref={joinContinuePath(firstParam(params.return_to))}
        secondTry={secondTry}
        className={cn(
          "relative z-10 mx-4 mt-6 sm:mx-10 lg:absolute lg:right-10 lg:m-0 lg:w-[36rem]",
          secondTry ? "lg:top-[4.25rem]" : "lg:top-24",
        )}
      />
    </main>
  );
}
