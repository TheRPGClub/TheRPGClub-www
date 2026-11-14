import { redirect } from "next/navigation";
import { fetchPublicWinners } from "@/lib/api/public-winners";
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

  const [session, allWinners] = await Promise.all([
    getSession(),
    fetchPublicWinners(),
  ]);
  // The winners follow Voting & GOTM. A signed-in viewer's session says
  // whether they're shown it; for a visitor the API's public read decides
  // (it comes back empty or fails, and the page falls back to plain words).
  const winners =
    session && !featureView(session.features).shown("voting_gotm")
      ? []
      : allWinners;

  return (
    <FrontPage
      winners={winners}
      signInHref={discordSignInUrl()}
      profileHref={session ? `/members/${session.principal.discord_id}` : null}
      authFailed={firstParam(params?.error) === "auth_failed"}
    />
  );
}
