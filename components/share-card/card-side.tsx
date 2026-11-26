import type { VotingCategory } from "@/lib/api/types";
import type { ShareCardFonts, ShareCardPalette } from "@/lib/share-card/palette";
import type { ShareCardWinner } from "@/lib/share-card/select";
import { TRACK_PLATES } from "@/components/issue/track-plate";

// The Share Card's right-hand side (card.tsx): the round's covers, or the
// flat hero's two track plates for the brand-only card. Inline styles only:
// ImageResponse draws without the stylesheet.

type Look = { palette: ShareCardPalette; fonts: ShareCardFonts };

const LABELS: Record<VotingCategory, string> = { gotm: "GOTM", nr_gotm: "NR-GOTM" };

function trackColour(kind: VotingCategory, palette: ShareCardPalette) {
  return kind === "gotm"
    ? { bg: palette.gotm, fg: palette.gotmForeground }
    : { bg: palette.nr, fg: palette.nrForeground };
}

function Cover({ winner, width, palette, fonts }: Look & { winner: ShareCardWinner; width: number }) {
  const height = Math.round((width * 4) / 3);
  const { bg, fg } = trackColour(winner.kind, palette);
  return (
    <div style={{ display: "flex", flexDirection: "column", width }}>
      {winner.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws plain img, not next/image
        <img src={winner.coverUrl} width={width} height={height} alt="" style={{ objectFit: "cover", borderRadius: 6 }} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            width,
            height,
            padding: 20,
            borderRadius: 6,
            background: palette.card,
            border: `2px solid ${palette.border}`,
            fontFamily: fonts.headline,
            fontSize: 40,
            lineHeight: 0.95,
          }}
        >
          {winner.title}
        </div>
      )}
      <div style={{ display: "flex", marginTop: 14 }}>
        <span
          style={{
            background: bg,
            color: fg,
            fontFamily: fonts.label,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.06em",
            padding: "4px 10px",
            borderRadius: 3,
          }}
        >
          {LABELS[winner.kind]}
        </span>
      </div>
    </div>
  );
}

export function ShareCardCovers({ winners, palette, fonts }: Look & { winners: ShareCardWinner[] }) {
  const width = winners.length > 1 ? 232 : 300;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
      {winners.map((w) => (
        <Cover key={w.kind} winner={w} width={width} palette={palette} fonts={fonts} />
      ))}
    </div>
  );
}

export function ShareCardPlates({ palette, fonts }: Look) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, width: 420 }}>
      {(["gotm", "nr_gotm"] as const).map((kind) => {
        const { bg, fg } = trackColour(kind, palette);
        return (
          <div
            key={kind}
            style={{ display: "flex", flexDirection: "column", background: bg, color: fg, borderRadius: 8, padding: "22px 26px" }}
          >
            <span style={{ fontFamily: fonts.headline, fontSize: 50, lineHeight: 0.9 }}>{TRACK_PLATES[kind].name}</span>
            <span style={{ fontSize: 21, marginTop: 12, opacity: 0.85 }}>{TRACK_PLATES[kind].blurb}</span>
          </div>
        );
      })}
    </div>
  );
}
