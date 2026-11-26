import type { ShareCardIssue, ShareCardWinner } from "@/lib/share-card/select";
import { SHARE_CARD_ART } from "@/lib/share-card/crop";
import { Burst } from "@/components/share-card/burst";
import { Footer, Pitch, issueLine, type Look } from "@/components/share-card/card-parts";
import { CoverSlot } from "@/components/share-card/cover-slot";

// "The Cover" (option B, picked by the owner): the GOTM's key art full-bleed
// under the hero's dark fade from the left, the pitch on the left, the GOTM
// burst, "This month the club plays <title>" top-right (an older round,
// reached by an old ?round= link: "Round N · the club played <title>") and
// both covers small at the bottom-right. The art arrives cut to its box (lib/share-card/crop).

const FADE_LEFT =
  "linear-gradient(90deg, rgba(11,11,13,1) 0%, rgba(11,11,13,0.97) 34%, rgba(11,11,13,0.55) 52%, rgba(11,11,13,0.10) 72%, rgba(11,11,13,0.35) 100%)";
const FADE_FOOT = "linear-gradient(0deg, rgba(11,11,13,0.85) 0%, rgba(11,11,13,0) 40%)";
const full = { position: "absolute", left: 0, top: 0, width: 1200, height: 630 } as const;

export function ShareCardCover({
  issue,
  lead,
  winners,
  artSrc,
  logoSrc,
  palette,
  fonts,
}: Look & {
  issue: ShareCardIssue;
  lead: ShareCardWinner;
  winners: ShareCardWinner[];
  artSrc: string;
  logoSrc: string;
}) {
  return (
    <div style={{ ...full, display: "flex", background: palette.background, color: palette.foreground, fontFamily: fonts.body }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws plain img, not next/image */}
      <img
        src={artSrc}
        width={SHARE_CARD_ART.width}
        height={SHARE_CARD_ART.height}
        alt=""
        style={{ position: "absolute", left: SHARE_CARD_ART.left, top: 0 }}
      />
      <div style={{ ...full, backgroundImage: FADE_LEFT }} />
      <div style={{ ...full, backgroundImage: FADE_FOOT }} />

      <div style={{ position: "absolute", left: 60, top: 50, display: "flex" }}>
        <Pitch palette={palette} fonts={fonts} masthead={150} headline={50} />
      </div>

      <div style={{ position: "absolute", right: 56, top: 46, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <span
          style={{
            fontFamily: fonts.label,
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: palette.dimForeground,
            textShadow: "0 1px 8px #000",
          }}
        >
          {issue.latest ? "This month the club plays" : `Round ${issue.round} · the club played`}
        </span>
        <span
          style={{
            width: 420,
            fontFamily: fonts.headline,
            fontSize: 52,
            lineHeight: 0.95,
            textTransform: "uppercase",
            textAlign: "right",
            justifyContent: "flex-end",
            textShadow: "0 2px 14px rgba(0,0,0,0.8)",
          }}
        >
          {lead.title}
        </span>
      </div>

      <Burst
        fonts={fonts}
        size={170}
        fill={palette.highlight}
        ink={palette.background}
        lines={["Game", "of the", "Month"]}
        fontSize={27}
        rotate={-9}
        style={{ left: 640, top: 210 }}
      />

      <div style={{ position: "absolute", right: 56, bottom: 44, display: "flex", alignItems: "flex-end", gap: 14 }}>
        {winners.map((w) => (
          <CoverSlot key={w.kind} winner={w} width={150} height={200} edge={6}
            shadow="0 10px 28px rgba(0,0,0,0.6)" palette={palette} fonts={fonts} />
        ))}
      </div>

      <div style={{ position: "absolute", left: 60, bottom: 44, display: "flex" }}>
        <Footer palette={palette} fonts={fonts} logoSrc={logoSrc} logoSize={56} fontSize={20} text={issueLine(issue)} />
      </div>
    </div>
  );
}
