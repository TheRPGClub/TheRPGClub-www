import type { Look } from "@/components/share-card/card-parts";

// The front page's starburst for the Share Card, drawn as an inline SVG
// polygon (no drop-shadow filters: the renderer has none).

const BURST_POINTS =
  "50,0 57,17 73,6 72,25 91,21 82,38 100,43 86,55 98,69 79,71 84,90 66,82 62,100 50,87 38,100 34,82 16,90 21,71 2,69 14,55 0,43 18,38 9,21 28,25 27,6 43,17";

// The front page's starburst, a track's badge.
export function Burst({
  fonts,
  size,
  fill,
  ink,
  lines,
  fontSize,
  rotate,
  style,
}: Pick<Look, "fonts"> & {
  size: number;
  fill: string;
  ink: string;
  lines: string[];
  fontSize: number;
  rotate: number;
  // Placement only.
  style: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", left: 0, top: 0 }}>
        <polygon points={BURST_POINTS} fill={fill} />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: fonts.headline,
          textTransform: "uppercase",
          fontSize,
          lineHeight: 0.92,
          color: ink,
        }}
      >
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    </div>
  );
}
