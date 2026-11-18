import { redirect } from "next/navigation";
import { fetchPublicWinners } from "@/lib/api/public-winners";
import { fetchCodexPage } from "@/lib/api/codex";
import { eventYear } from "@/lib/codex/history";
import { getSession } from "@/lib/session";
import { featureView } from "@/lib/features";
import { firstParam } from "@/lib/search-params";
import { callbackPath, discordSignInUrl } from "@/lib/sign-in";
import { FrontPage } from "@/components/landing/front-page";

// The front page, for everyone. The recent winners are public club content
// (GET /api/v1/public/winners), so a logged-out visit gets them too.

type HomeProps = {
  searchParams?: Promise<{
    token?: string | string[];
    return_to?: string | string[];
    error?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const token = firstParam(params?.token);

  // Until the cutover (www#84) the API hands the token to the front page.
  if (token) {
    redirect(callbackPath(token, firstParam(params?.return_to)));
  }

  const [session, allWinners, history] = await Promise.all([
    getSession(),
    fetchPublicWinners(),
    // The earliest History Event, for the Club History band. Signed out
    // this is the public read, found only while the Club Codex is Live.
    fetchCodexPage("history_event", 1, 1),
  ]);
  // The winners follow Voting & GOTM. A signed-in viewer's session says
  // whether they're shown it; for a visitor the API's public read decides
  // (it comes back empty or fails, and the page falls back to plain words).
  const winners =
    session && !featureView(session.features).shown("voting_gotm")
      ? []
      : allWinners;

  // The Club History band shows while the Club Codex is Live (a Member's
  // read also finds it in Preview when they're staff, so the session says
  // Live: shown, and not shown only for being staff) and the viewer hasn't
  // hidden it, and only once there is a History Event.
  const codex = featureView(session?.features);
  const first = history && history !== "not_found" ? history.data[0] : undefined;
  const historyYear =
    first && (!session || (codex.shown("club_codex") && !codex.preview("club_codex"))) ? eventYear(first) : null;

  return (
    <FrontPage
      historyYear={historyYear}
      winners={winners}
      signInHref={discordSignInUrl()}
      profileHref={session ? `/members/${session.principal.discord_id}` : null}
      authFailed={firstParam(params?.error) === "auth_failed"}
    />
  );
}
