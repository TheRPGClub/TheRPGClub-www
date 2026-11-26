import { TRACK_PLATES } from "@/components/issue/track-plate";
import { Footer, Pitch, type Look } from "@/components/share-card/card-parts";

// The brand-only Share Card: no winners to show (none yet, or the API is
// down). The pitch beside the flat hero's two track plates.

export function ShareCardBrand({ logoSrc, palette, fonts }: Look & { logoSrc: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: palette.background, color: palette.foreground, fontFamily: fonts.body }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, padding: "52px 0 48px 64px" }}>
        <Pitch palette={palette} fonts={fonts} masthead={156} headline={50} />
        <Footer palette={palette} fonts={fonts} logoSrc={logoSrc} logoSize={88} fontSize={26} text="A Discord club for RPG players" />
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "flex-end", gap: 12, padding: "0 64px 48px 0" }}>
        {(["gotm", "nr_gotm"] as const).map((kind) => (
          <div
            key={kind}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 6,
              padding: "22px 24px 24px",
              background: kind === "gotm" ? palette.gotm : palette.nr,
              color: kind === "gotm" ? palette.gotmForeground : palette.nrForeground,
            }}
          >
            <span style={{ fontFamily: fonts.headline, fontSize: 46, lineHeight: 0.9, textTransform: "uppercase" }}>
              {TRACK_PLATES[kind].name}
            </span>
            <span style={{ width: 400, marginTop: 10, fontSize: 20, fontWeight: 500, lineHeight: 1.25, opacity: 0.88 }}>
              {TRACK_PLATES[kind].blurb}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
