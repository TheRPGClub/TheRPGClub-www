import type { ShareCardIssue, ShareCardWinner } from "@/lib/share-card/select";
import { Burst } from "@/components/share-card/burst";
import { Footer, Pitch, issueLine, type Look } from "@/components/share-card/card-parts";

// "The Winners' Stand" (option A): The Cover's stand-in when the GOTM has no
// key art (or it failed to load). The pitch on the left, the round's covers
// standing on the right with their track labels, titles and bursts.

const PICK = { gotm: { label: "Game of the Month", drop: 0 }, nr_gotm: { label: "Non-RPG GOTM", drop: 60 } };

function Pick({ winner, palette, fonts }: Look & { winner: ShareCardWinner }) {
  const gotm = winner.kind === "gotm";
  const track = gotm ? palette.gotm : palette.nr;
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", width: 250, marginTop: PICK[winner.kind].drop }}>
      {winner.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws plain img, not next/image
        <img src={winner.coverUrl} width={250} height={333} alt="" style={{ objectFit: "cover", borderBottom: `8px solid ${track}` }} />
      ) : (
        <div style={{ display: "flex", width: 250, height: 333, background: palette.card, borderBottom: `8px solid ${track}` }} />
      )}
      <span
        style={{
          marginTop: 14,
          fontFamily: fonts.label,
          fontWeight: 800,
          fontSize: 23,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: gotm ? palette.gotm : palette.nrSoft,
        }}
      >
        {PICK[winner.kind].label}
      </span>
      <span style={{ marginTop: 4, fontFamily: fonts.headline, fontSize: 30, lineHeight: 0.95, textTransform: "uppercase" }}>
        {winner.title}
      </span>
      {gotm ? (
        <Burst fonts={fonts} size={150} fill={palette.highlight} ink={palette.background}
          lines={["Game", "of the", "Month"]} fontSize={24} rotate={-9} style={{ left: -58, top: -40 }} />
      ) : (
        <Burst fonts={fonts} size={128} fill={palette.nr} ink={palette.nrForeground}
          lines={["Non-RPG", "Game of", "the Month"]} fontSize={19} rotate={8} style={{ right: -48, top: -44 }} />
      )}
    </div>
  );
}

export function ShareCardStand({
  issue,
  winners,
  logoSrc,
  palette,
  fonts,
}: Look & { issue: ShareCardIssue; winners: ShareCardWinner[]; logoSrc: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: palette.background, color: palette.foreground, fontFamily: fonts.body }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600, padding: "52px 0 48px 64px" }}>
        <Pitch palette={palette} fonts={fonts} masthead={156} headline={50} />
        <Footer palette={palette} fonts={fonts} logoSrc={logoSrc} logoSize={88} fontSize={26} text={issueLine(issue)} />
      </div>
      <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", gap: 22, padding: "56px 64px 0 0" }}>
        {winners.map((w) => (
          <Pick key={w.kind} winner={w} palette={palette} fonts={fonts} />
        ))}
      </div>
    </div>
  );
}
