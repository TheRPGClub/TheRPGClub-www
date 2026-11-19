import { redirect } from "next/navigation";
import { fetchPublicWinners } from "@/lib/api/public-winners";
import { fetchCodexPage } from "@/lib/api/codex";
import { eventYear } from "@/lib/codex/history";
import { getSession } from "@/lib/session";
import { firstParam } from "@/lib/search-params";
import { callbackPath, discordSignInUrl } from "@/lib/sign-in";
import { FrontPage } from "@/components/landing/front-page";

// The front page, for Visitors: a signed-in Member goes straight to their
// dashboard. The recent winners are public club content
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

  const [session, winners, history] = await Promise.all([
    getSession(),
    fetchPublicWinners(),
    // The earliest History Event, for the Club History band: the public
    // read, found only while the Club Codex is Live.
    fetchCodexPage("history_event", 1, 1),
  ]);
  if (session) redirect("/dashboard");

  // The winners and the Club History band are the API's public reads: they
  // come back empty or fail when their Feature isn't Live, and the page falls
  // back to plain words. The band shows only once there is a History Event.
  const first = history && history !== "not_found" ? history.data[0] : undefined;
  const historyYear = first ? eventYear(first) : null;

  return (
    <FrontPage
      historyYear={historyYear}
      winners={winners}
      signInHref={discordSignInUrl()}
      authFailed={firstParam(params?.error) === "auth_failed"}
    />
  );
}
