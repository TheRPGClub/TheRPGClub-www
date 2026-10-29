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
  // A pull-quote's rule and text, on the review's own page. A GOTM winner's
  // review quotes in the same hue as its score; an unplaced game's stays
  // quiet white.
  quote: string;
  // A soft glow behind the review's own page — the page itself carrying the
  // hue, rather than a bordered panel wearing it. Fades out before the fold,
  // so it reads as atmosphere behind the banner, not a tinted box around
  // anything in particular.
  ambient: string;
}

// Values are the Monthly Issue track inks (GOTM red, NR-GOTM violet, paper
// for an unplaced game): flat fills and solid rules, no glows. The slider's
// ramp stays a ramp because it reads as a scale, but within one ink.
export const reviewAccents: Record<ReviewAccent, ReviewAccentStyle> = {
  brand: {
    label: "Game of the Month",
    surface: "border-gotm/50 bg-ink-2",
    rule: "from-gotm via-gotm/40 to-transparent",
    track: "from-gotm/25 to-gotm/10",
    fill: "from-gotm-soft to-gotm",
    readout: "text-paper",
    glow: "",
    wash: "from-ink to-transparent",
    thumb: "border-paper bg-gotm ring-gotm/40",
    caret: "bg-gotm",
    pill: "bg-gotm text-white",
    quote: "border-gotm text-paper",
    ambient: "from-transparent to-transparent",
  },
  purple: {
    label: "Non-RPG Game of the Month",
    surface: "border-nr/50 bg-ink-2",
    rule: "from-nr via-nr/40 to-transparent",
    track: "from-nr/25 to-nr/10",
    fill: "from-nr-soft to-nr",
    readout: "text-paper",
    glow: "",
    wash: "from-ink to-transparent",
    thumb: "border-paper bg-nr ring-nr/40",
    caret: "bg-nr",
    pill: "bg-nr text-white",
    quote: "border-nr text-paper",
    ambient: "from-transparent to-transparent",
  },
  neutral: {
    label: null,
    surface: "border-rule bg-ink-2",
    rule: "from-paper/60 via-paper/20 to-transparent",
    track: "from-paper/20 to-paper/[0.06]",
    fill: "from-paper to-paper-dim",
    readout: "text-paper",
    glow: "",
    wash: "from-ink to-transparent",
    thumb: "border-paper bg-paper ring-paper/30",
    caret: "bg-paper-dim",
    pill: "bg-paper/10 text-paper-dim",
    quote: "border-paper/30 text-paper",
    ambient: "from-transparent to-transparent",
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
