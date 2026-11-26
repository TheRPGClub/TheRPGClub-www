// The default Theme's colours for the Share Card image. ImageResponse draws
// without the stylesheet, so the card can't read the CSS tokens: these are
// the Monthly Issue Theme's token values (themes/monthly-issue/theme.css),
// named by token. palette.test.ts fails when the two drift apart.

export const SHARE_CARD_PALETTE = {
  background: "#0b0b0d",
  foreground: "#f4f4f0",
  dimForeground: "#b9b9b2",
  card: "#141417",
  border: "#2a2a31",
  gotm: "#ff0000",
  gotmForeground: "#ffffff",
  nr: "#8a4dff",
  nrSoft: "#b896ff",
  nrForeground: "#ffffff",
  highlight: "#ffd400",
} as const;

export type ShareCardPalette = typeof SHARE_CARD_PALETTE;

// The font family names the card's styles use; the route registers the
// default Theme's faces under them (lib/share-card/assets.ts).
export const SHARE_CARD_FONTS = {
  headline: "Anton",
  label: "Barlow Condensed",
  body: "Barlow",
} as const;

export type ShareCardFonts = typeof SHARE_CARD_FONTS;
