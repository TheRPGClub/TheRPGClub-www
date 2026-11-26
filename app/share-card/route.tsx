import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { fetchShareCardWinners } from "@/lib/api/public-winners";
import { inlineImages, loadShareCardFonts, loadShareCardLogo } from "@/lib/share-card/assets";
import { SHARE_CARD_SIZE } from "@/lib/share-card/metadata";
import { SHARE_CARD_FONTS, SHARE_CARD_PALETTE } from "@/lib/share-card/palette";
import { planShareCard, type ShareCardIssue, type ShareCardWinner } from "@/lib/share-card/select";
import { ShareCard } from "@/components/share-card/card";

// The Share Card image (spec api#518), named by the site metadata as
// /share-card?round=<latest decided round>. A round's card never changes,
// so it is cached for good under its URL. Without that round (the API down
// or asleep, no winners, a bad query, a cover that won't load) it is the
// brand-only card on a short cache: a CDN copy of a good card is never
// replaced, and the real one lands once the read works again. A round whose
// GOTM key art failed to load stands its covers instead, also briefly.

const FOREVER = "public, max-age=31536000, s-maxage=31536000, immutable";
const BRIEFLY = "public, max-age=300, s-maxage=300";

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
  const plan = planShareCard(await fetchShareCardWinners(), request.nextUrl.searchParams.get("round"));
  if (plan.kind === "round") {
    try {
      const { winners, complete } = await inlineImages(plan.winners);
      return png(await render(plan.issue, winners), complete ? FOREVER : BRIEFLY);
    } catch (error) {
      console.error("share card: round card failed, sending the brand card", error);
    }
  }
  return png(await render(null, []), BRIEFLY);
}
