import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { fetchShareCardWinners } from "@/lib/api/public-winners";
import { inlineImages, loadShareCardFonts, loadShareCardLogo } from "@/lib/share-card/assets";
import { SHARE_CARD_SIZE } from "@/lib/share-card/metadata";
import { SHARE_CARD_FONTS, SHARE_CARD_PALETTE } from "@/lib/share-card/palette";
import { planShareCard, type ShareCardIssue, type ShareCardWinner } from "@/lib/share-card/select";
import { ShareCard } from "@/components/share-card/card";

// The Share Card image (spec api#518), named by the site metadata as
// /share-card?round=<latest decided round>&v=<hash of what it draws>
// (lib/share-card/select). A card is cached for good only when the `v` asked
// for is the card drawn, so a URL never pins a card that later changes (a
// round decided in steps, a cover added); any other `v` draws the current
// card on a short cache. Without that round (the API down
// or asleep, no winners, a bad query, a cover that won't load) it is the
// brand-only card on a short cache: a CDN copy of a good card is never
// replaced, and the real one lands once the read works again. A round whose
// GOTM key art failed to load stands its covers instead, also briefly. If
// even the brand card can't be drawn (its fonts or logo unreadable), the
// answer is a 503 on a one-minute cache, never a long-cached error.

const FOREVER = "public, max-age=31536000, s-maxage=31536000, immutable";
const BRIEFLY = "public, max-age=300, s-maxage=300";
const RETRY_SOON = "public, max-age=60, s-maxage=60";

// Rendered to bytes before the response goes out, so a failed render can
// still fall back instead of streaming a broken image under a long cache.
async function render(issue: ShareCardIssue | null, winners: ShareCardWinner[]): Promise<ArrayBuffer> {
  const [fonts, logoSrc] = await Promise.all([loadShareCardFonts(), loadShareCardLogo()]);
  const image = new ImageResponse(
    <ShareCard
      issue={issue}
      winners={winners}
      logoSrc={logoSrc}
      palette={SHARE_CARD_PALETTE}
      fonts={SHARE_CARD_FONTS}
    />,
    { ...SHARE_CARD_SIZE, fonts },
  );
  return image.arrayBuffer();
}

function png(body: ArrayBuffer, cacheControl: string) {
  return new Response(body, {
    headers: { "Content-Type": "image/png", "Cache-Control": cacheControl },
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const plan = planShareCard(await fetchShareCardWinners(), params.get("round"));
  if (plan.kind === "round") {
    try {
      const { winners, complete } = await inlineImages(plan.winners);
      const settled = complete && params.get("v") === plan.version;
      return png(await render(plan.issue, winners), settled ? FOREVER : BRIEFLY);
    } catch (error) {
      console.error("share card: round card failed, sending the brand card", error);
    }
  }
  try {
    return png(await render(null, []), BRIEFLY);
  } catch (error) {
    console.error("share card: brand card failed", error);
    return new Response("Share card unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain", "Cache-Control": RETRY_SOON, "Retry-After": "60" },
    });
  }
}
