import type { ShareCardFonts, ShareCardPalette } from "@/lib/share-card/palette";
import type { ShareCardWinner } from "@/lib/share-card/select";
import { ShareCardCovers, ShareCardPlates } from "@/components/share-card/card-side";

// The Share Card image (spec api#518), drawn by ImageResponse at 1200x630:
// the front page hero rebuilt in plain inline styles (no stylesheet, no
// Tailwind, flexbox only). This is the swappable look: the route
// (app/share-card/route.tsx) hands it plain props, so a new design is a new
// body for this component and nothing else.
//
// Left: the logo, the masthead and the headline, as on the landing pitch.
// Right: the round's covers (GOTM then NR-GOTM; a category without a winner
// is absent), or, for the brand-only card, the two track plates of the flat
// hero.

export type ShareCardProps = {
  // Empty for the brand-only card.
  winners: ShareCardWinner[];
  // Data URLs (or absolute URLs) the renderer can read.
  logoSrc: string;
  palette: ShareCardPalette;
  fonts: ShareCardFonts;
};

type Segment = { text: string; color?: string };

// A run of words on one line; Satori lays text out as flex items, so each
// word is its own item and the gap stands in for the spaces.
function Line({ segments, gap }: { segments: Segment[]; gap: number }) {
  return (
    <div style={{ display: "flex", columnGap: gap }}>
      {segments.flatMap((s, i) =>
        s.text.split(" ").map((word, j) => (
          <span key={`${i}-${j}`} style={s.color ? { color: s.color } : undefined}>
            {word}
          </span>
        )),
      )}
    </div>
  );
}

export function ShareCard({ winners, logoSrc, palette, fonts }: ShareCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: palette.background,
        color: palette.foreground,
        fontFamily: fonts.body,
        padding: 56,
        gap: 48,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws plain img, not next/image */}
          <img src={logoSrc} width={64} height={64} alt="" />
          <span
            style={{
              fontFamily: fonts.label,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: palette.dimForeground,
            }}
          >
            The club plays together
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: fonts.headline,
            fontSize: 132,
            lineHeight: 0.82,
            marginTop: 36,
          }}
        >
          <Line gap={28} segments={[{ text: "The" }, { text: "RPG", color: palette.gotm }]} />
          <Line gap={28} segments={[{ text: "Club" }]} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: fonts.headline,
            fontSize: 50,
            lineHeight: 0.98,
            marginTop: "auto",
          }}
        >
          <Line gap={13} segments={[{ text: "An" }, { text: "RPG", color: palette.gotm }, { text: "and a" }]} />
          <Line gap={13} segments={[{ text: "wildcard,", color: palette.nrSoft }, { text: "every month." }]} />
          <Line gap={13} segments={[{ text: "Played together.", color: palette.highlight }]} />
        </div>
      </div>
      {winners.length > 0 ? (
        <ShareCardCovers winners={winners} palette={palette} fonts={fonts} />
      ) : (
        <ShareCardPlates palette={palette} fonts={fonts} />
      )}
    </div>
  );
}
