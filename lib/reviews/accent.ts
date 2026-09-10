import type { Game } from "@/lib/api/types";

// Which hue a review surface wears. The club's two categories each own one
// everywhere they appear — see components/voting/accents.ts, which owns the
// same mapping for the nomination board. This table is the review side of it:
// same scales, different parts, because a scoring control needs a ramp and a
// thumb where a tally card needs a crown and a pill.
export type ReviewAccent = "brand" | "purple" | "neutral";

export interface ReviewAccentStyle {
  // What the game is to the club, or null for one it never won. No filler
  // label — an invented category name would read as chrome.
  label: string | null;
  // The compose surface itself: a tinted edge, not a wash.
  surface: string;
  // A rule that starts bright at the leading edge and fades out to the right,
  // so it needs no end cap. Under the scorecard explainer's title; the three
  // variants are tuned to read at the same strength as each other, not at the
  // same numeric opacity — white carries further than a mid-tone hue.
  rule: string;
  // The scale, faint — where the score could go.
  track: string;
  // The score, full strength — lighter at 0, darker towards 100.
  fill: string;
  // The score readout, held at the light end of the ramp so a 95 stays as
  // legible as a 20 on the dark ground.
  readout: string;
  // Picked up by the readout only while the slider is being dragged.
  glow: string;
  // Washes the text side of a banner, the way the dashboard's cards and the
  // game page's hero do. Distinct from `glow`, which is a drop-shadow on the
  // score readout — same word, different job.
  wash: string;
  thumb: string;
  // Underlines the score field on hover and focus, so a borderless number
  // still announces itself as editable.
  caret: string;
  // The category badge, in the treatment the dashboard and game page use.
  pill: string;
}

export const reviewAccents: Record<ReviewAccent, ReviewAccentStyle> = {
  brand: {
    label: "Game of the Month",
    surface: "border-brand-500/40 bg-brand-500/[0.06]",
    rule: "from-brand-500/70 via-brand-500/20 to-transparent",
    track: "from-brand-300/25 to-brand-700/15",
    fill: "from-brand-300 to-brand-700",
    readout: "text-brand-200",
    glow: "drop-shadow-[0_0_12px_rgba(255,0,0,0.45)]",
    wash: "from-brand-950/40 to-transparent",
    thumb: "border-brand-200 bg-brand-500 ring-brand-500/40",
    caret: "bg-brand-400",
    pill: "bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-500/30",
  },
  purple: {
    label: "Non-RPG Game of the Month",
    surface: "border-purple-500/40 bg-purple-500/[0.06]",
    rule: "from-purple-500/70 via-purple-500/20 to-transparent",
    track: "from-purple-400/25 to-purple-700/15",
    fill: "from-purple-400 to-purple-700",
    readout: "text-purple-200",
    glow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]",
    wash: "from-purple-950/40 to-transparent",
    thumb: "border-purple-200 bg-purple-500 ring-purple-500/40",
    caret: "bg-purple-400",
    pill: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
  },
  neutral: {
    label: null,
    surface: "border-border bg-card",
    rule: "from-white/60 via-white/20 to-transparent",
    track: "from-white/20 to-white/[0.06]",
    fill: "from-white/80 to-white/35",
    readout: "text-foreground",
    glow: "drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]",
    wash: "from-muted/40 to-transparent",
    thumb: "border-white/80 bg-white/90 ring-white/30",
    caret: "bg-foreground/70",
    pill: "bg-muted/40 text-muted-foreground ring-1 ring-inset ring-border",
  },
};

/**
 * The hue a game's review surfaces wear. Mirrors the game page's own accent
 * pick so a GOTM winner's review window matches its header.
 */
export function accentForGame(
  game: Pick<Game, "gotm_won" | "nr_gotm_won"> | null | undefined,
): ReviewAccent {
  if (game?.gotm_won) return "brand";
  if (game?.nr_gotm_won) return "purple";
  return "neutral";
}
