import type { ShareCardFonts, ShareCardPalette } from "@/lib/share-card/palette";
import type { ShareCardIssue, ShareCardWinner } from "@/lib/share-card/select";
import { ShareCardBrand } from "@/components/share-card/card-brand";
import { ShareCardCover } from "@/components/share-card/card-cover";
import { ShareCardStand } from "@/components/share-card/card-stand";

// The Share Card image (spec api#518), drawn by ImageResponse at 1200x630
// in plain inline styles (no stylesheet, flexbox only). The route
// (app/share-card/route.tsx) hands it plain props; the look lives in this
// folder alone.
//
// - "The Cover" (card-cover.tsx), the owner's pick: the GOTM's key art
//   under the front page hero.
// - "The Winners' Stand" (card-stand.tsx) when the GOTM has no key art, or
//   the round has no GOTM.
// - The brand-only card (card-brand.tsx) without winners.

export type ShareCardProps = {
  // The round shown; null for the brand-only card.
  issue: ShareCardIssue | null;
  // GOTM then NR-GOTM, images as data URLs; empty for the brand-only card.
  winners: ShareCardWinner[];
  logoSrc: string;
  palette: ShareCardPalette;
  fonts: ShareCardFonts;
};

export function ShareCard({ issue, winners, logoSrc, palette, fonts }: ShareCardProps) {
  const look = { palette, fonts };
  if (!issue || winners.length === 0) return <ShareCardBrand logoSrc={logoSrc} {...look} />;
  const lead = winners.find((w) => w.kind === "gotm");
  if (lead?.artUrl) {
    return <ShareCardCover issue={issue} lead={lead} winners={winners} artSrc={lead.artUrl} logoSrc={logoSrc} {...look} />;
  }
  return <ShareCardStand issue={issue} winners={winners} logoSrc={logoSrc} {...look} />;
}
