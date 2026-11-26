import type { ShareCardWinner } from "@/lib/share-card/select";
import type { Look } from "@/components/share-card/card-parts";

// One winner's cover on a Share Card, edged in its track's colour. A game
// with no cover gets a plate the same size with its title set in the
// headline face, like a plain-bound book, so the slot still names the game.
export function CoverSlot({
  winner,
  width,
  height,
  edge,
  shadow,
  palette,
  fonts,
}: Look & { winner: ShareCardWinner; width: number; height: number; edge: number; shadow?: string }) {
  const track = winner.kind === "gotm" ? palette.gotm : palette.nr;
  const frame = { borderBottom: `${edge}px solid ${track}`, boxShadow: shadow };
  if (winner.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- ImageResponse draws plain img, not next/image
      <img src={winner.coverUrl} width={width} height={height} alt="" style={{ objectFit: "cover", ...frame }} />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        padding: Math.round(width * 0.09),
        background: palette.card,
        borderTop: `1px solid ${palette.border}`,
        borderLeft: `1px solid ${palette.border}`,
        borderRight: `1px solid ${palette.border}`,
        ...frame,
      }}
    >
      <span
        style={{
          fontFamily: fonts.headline,
          fontSize: Math.round(width * 0.14),
          lineHeight: 1,
          textTransform: "uppercase",
          textAlign: "center",
          color: palette.foreground,
        }}
      >
        {winner.title}
      </span>
    </div>
  );
}
