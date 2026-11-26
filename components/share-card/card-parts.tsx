import type { ShareCardFonts, ShareCardPalette } from "@/lib/share-card/palette";

// The pieces every Share Card layout shares: the masthead, the headline, the
// burst and the logo footer. Inline styles only (ImageResponse draws without
// the stylesheet, flexbox only); one div per line, no <br>.

export type Look = { palette: ShareCardPalette; fonts: ShareCardFonts };

type Segment = { text: string; color?: string };

// One line of mixed colours. Satori lays each span out as a flex item;
// whiteSpace "pre" keeps the spaces inside the segments.
function Line({ segments }: { segments: Segment[] }) {
  return (
    <div style={{ display: "flex", whiteSpace: "pre" }}>
      {segments.map((s, i) => (
        <span key={i} style={s.color ? { color: s.color } : undefined}>
          {s.text}
        </span>
      ))}
    </div>
  );
}

// "THE RPG / CLUB" and "An RPG and a wildcard, / every month. / Played
// together.", as the landing pitch sets them.
export function Pitch({ palette, fonts, masthead, headline }: Look & { masthead: number; headline: number }) {
  const anton = { display: "flex", flexDirection: "column", fontFamily: fonts.headline, textTransform: "uppercase" } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ ...anton, fontSize: masthead, lineHeight: 0.8, letterSpacing: "-0.01em" }}>
        <Line segments={[{ text: "The " }, { text: "RPG", color: palette.gotm }]} />
        <Line segments={[{ text: "Club" }]} />
      </div>
      <div style={{ ...anton, fontSize: headline, lineHeight: 0.94, marginTop: Math.round(headline * 0.75) }}>
        <Line
          segments={[
            { text: "An " },
            { text: "RPG", color: palette.gotm },
            { text: " and a " },
            { text: "wildcard", color: palette.nrSoft },
            { text: "," },
          ]}
        />
        <Line segments={[{ text: "every month." }]} />
        <Line segments={[{ text: "Played together.", color: palette.highlight }]} />
      </div>
    </div>
  );
}

// The logo beside a tracked-caps line ("Round 144 · November 2026").
export function Footer({
  palette,
  fonts,
  logoSrc,
  logoSize,
  fontSize,
  text,
}: Look & { logoSrc: string; logoSize: number; fontSize: number; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws plain img, not next/image */}
      <img src={logoSrc} width={logoSize} height={logoSize} alt="" />
      <span
        style={{
          fontFamily: fonts.label,
          fontWeight: 800,
          fontSize,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: palette.dimForeground,
        }}
      >
        {text}
      </span>
    </div>
  );
}

export function issueLine(issue: { round: number; monthYear: string }): string {
  return issue.monthYear ? `Round ${issue.round} · ${issue.monthYear}` : `Round ${issue.round}`;
}
