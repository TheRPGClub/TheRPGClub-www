---
name: Monthly Issue
description: Every GOTM round is an issue of the club's own 90s game magazine.
colors:
  background: "#0b0b0d"
  card: "#141417"
  muted: "#1d1d22"
  border: "#2a2a31"
  border-strong: "#3a3a43"
  foreground: "#f4f4f0"
  dim-foreground: "#b9b9b2"
  faint-foreground: "#8d8d87"
  gotm: "#ff0000"
  gotm-soft: "#ff5a4f"
  gotm-foreground: "#ffffff"
  nr: "#8a4dff"
  nr-soft: "#b896ff"
  nr-foreground: "#ffffff"
  highlight: "#ffd400"
  highlight-foreground: "#0b0b0d"
  highlight-muted-foreground: "#3a3200"
  destructive: "oklch(0.74 0.17 52)"
  destructive-foreground: "#2a1300"
  ok: "#5fd08a"
  phase-approved: "#2ec4b6"
  phase-done: "#5fd08a"
  phase-rejected: "#ff4fa3"
  phase-rejected-deep: "#8a1559"
  slip-muted-foreground: "#55554f"
  rarity-common: "#f4f4f0"
  rarity-uncommon: "#5fd08a"
  rarity-rare: "#4aa8ff"
  rarity-ultra: "#ff4fa3"
  rarity-foreground: "#0b0b0d"
  provider-retroachievements: "#2ec4b6"
  provider-steam: "#66c0f4"
  provider-psn: "#4677e6"
  provider-foreground: "#0b0b0d"
  tier-bronze: "#c8814a"
  tier-silver: "#c0c6cc"
  tier-gold: "#e0b84a"
  news-announcements: "#ff5ca8"
  news-releases: "#b4e05a"
  news-emulation: "#2fd3c0"
  news-industry: "#6c9bff"
  news-hardware: "#d4a373"
  news-rumours: "#c0c4d6"
  news-general: "#8d8d87"
  format-slots: "#46cbe6"
  format-pool: "#93a3ff"
  format-assignment: "#52cf98"
  holly: "#3fbf8a"
  tinsel: "#e9c46a"
  region-na: "#8fb4ff"
  region-eu: "#8fe0a6"
  region-jp: "#ffa3c9"
  region-foreground: "#0b0b0d"
  codex-history: "#eadcb8"
  codex-lore: "#52d6a4"
  codex-fact: "#ff8ad8"
  codex-fact-light: "#ffb3e6"
  codex-lore-deep: "#123b2e"
  codex-lore-print: "#1f5c48"
  kind-founding: "#f59ac0"
  kind-staff: "#3fd0c9"
  kind-platform: "#7cb6ff"
  kind-rules: "#b7dd5e"
  kind-milestone: "#eadcb8"
  foil-foreground: "#0b0b0d"
typography:
  numeral:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "5.75rem"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "-0.01em"
  display:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "5.75rem"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "normal"
  headline:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "normal"
  title:
    fontFamily: "Anton, Impact, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "normal"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
    fontFeature: "\"tnum\" 1"
  label:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.06em"
  chip:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  xs: "2px"
  sm: "2.4px"
  md: "3.2px"
  lg: "4px"
  die-cut: "6px"
  full: "9999px"
spacing:
  gutter-phone: "16px"
  gutter: "28px"
  grid-gap: "20px"
  section: "40px"
  panel: "28px"
  topbar: "60px"
  rail: "23rem"
components:
  button-primary:
    backgroundColor: "{colors.gotm}"
    textColor: "{colors.gotm-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.highlight-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-nr:
    backgroundColor: "{colors.nr}"
    textColor: "{colors.nr-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-on-highlight:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "36px"
  button-destructive-solid:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-destructive-outline:
    backgroundColor: "transparent"
    textColor: "{colors.destructive}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  chip-neutral:
    backgroundColor: "rgb(244 244 240 / 0.08)"
    textColor: "{colors.dim-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-gotm:
    backgroundColor: "{colors.gotm}"
    textColor: "{colors.gotm-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    height: "24px"
  chip-nr:
    backgroundColor: "{colors.nr}"
    textColor: "{colors.nr-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    height: "24px"
  chip-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.highlight-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    height: "24px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.dim-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.gotm}"
    textColor: "{colors.gotm-foreground}"
  search-field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "36px"
  round-panel:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.highlight-foreground}"
    rounded: "{rounded.md}"
    padding: "14px 18px 16px"
  feature-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  game-cover-fallback:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.faint-foreground}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
  achievement-icon:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.die-cut}"
    size: "56px"
  achievement-icon-locked:
    backgroundColor: "transparent"
    textColor: "{colors.faint-foreground}"
    rounded: "{rounded.die-cut}"
    size: "56px"
  chip-rarity-ultra:
    backgroundColor: "{colors.rarity-ultra}"
    textColor: "{colors.rarity-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-provider-retroachievements:
    backgroundColor: "{colors.provider-retroachievements}"
    textColor: "{colors.provider-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-provider-steam:
    backgroundColor: "{colors.provider-steam}"
    textColor: "{colors.provider-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-provider-psn:
    backgroundColor: "{colors.provider-psn}"
    textColor: "{colors.provider-foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  foil-stamp:
    textColor: "{colors.foil-foreground}"
    typography: "{typography.title}"
    rounded: "{rounded.xs}"
    padding: "8px 12px 6px"
  binder:
    backgroundColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "10px"
  binder-page:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  view-tab:
    backgroundColor: "{colors.card}"
    textColor: "{colors.faint-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
  day-tape:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    padding: "4px 16px 3px"
  news-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  news-tag:
    backgroundColor: "{colors.news-announcements}"
    textColor: "{colors.background}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "22px"
---

# Monthly Issue

The first Theme and the default (api ADR-0008): every GOTM round is an issue of the club's own 90s game magazine. It is a dark Theme (`data-mode="dark"`, browser theme colour `#0b0b0d`).

- `theme.css`: the tokens, scoped to `[data-theme="monthly-issue"]` in `@layer themes` (above Tailwind's utilities).
- `primitives.css`: how every shadcn primitive looks in this Theme, by its `data-slot` and its `data-variant`, `data-size` or `data-tone` (same scope and layer). The primitives keep only layout, the focus ring and the disabled state. Each rule carries a slot's (or a variant's) whole look as one `@apply`, so the order between its states stays Tailwind's.
- `fonts.ts`: Anton, Barlow and Barlow Condensed through `next/font`, preloaded because this is the default Theme.
- `README.md`: this file. The palette-to-token mapping, then the Theme's own design rules (moved here from the site-wide `DESIGN.md`, which keeps only the floor every Theme meets).

## Tokens

The stylesheet sets every token the token map in `app/globals.css` reads (`themes/tokens.test.ts` checks it):

- **Surface and text roles** (shadcn's, plus three): `background`, `foreground`, `dim-foreground`, `faint-foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent` (each with its `-foreground`), `destructive`, `destructive-foreground`, `border`, `border-strong`, `input`, `ring`, `chart-1..5`, `sidebar-*`.
- **Club colours** (a Theme may change them, but keeps them distinct and readable): `gotm`, `gotm-soft`, `gotm-foreground`, `nr`, `nr-soft`, `nr-foreground`, `highlight`, `highlight-foreground`, `highlight-muted-foreground`, `rarity-common`, `rarity-uncommon`, `rarity-rare`, `rarity-ultra`, `rarity-foreground`, plus `ok` (staff desk), the Suggestion phase bands `phase-approved`, `phase-done`, `phase-rejected` and `phase-rejected-deep` (type on a light slip), `slip-muted-foreground` (muted type on a light slip), the News inks `news-*`, and foil (`foil-conic`, `foil-sheen`, `foil-foreground`, drawn by the `foil` utility).
- **Shape**: `radius` (0.25rem; `rounded-xs` to `rounded-4xl` derive from it).
- **Type**: `typeface-body`, `typeface-display`, `typeface-label` (Tailwind's `font-sans`, `font-display`, `font-cond`), and the voice settings `font-headline` and `font-label` read: `headline-weight`, `headline-case`, `headline-leading`, `label-weight`, `label-case`, `label-tracking`.

Fixed colours sit outside every Theme, in `app/globals.css`: the Provider colours `provider-*` (with `provider-foreground` for the type on them), the PSN tier metals `tier-*`, the logo's `brand-*` ramp, and the sampled game tint (`lib/achievements/tint-color.ts`, with its own ink/paper contrast pair).

## Palette to token mapping

The Monthly Issue palette names (`ink`, `ink-2`, `ink-3`, `rule`, `rule-strong`, `paper`, `paper-dim`, `paper-mute`) and the two `-ink` club names are this Theme's own vocabulary, not Tailwind colours. The www#86 codemod rewrote every use with the rules below, in order, then removed the names from `app/globals.css`; `structure/no-palette-colors` (an error) keeps them out of the code, and catches `highlight-ink` and `destructive-ink` too. Every row keeps the exact value, so nothing visibly changed. Read the rules when you meet a palette name in this README or an old branch.

The codemod went two steps past the rules as written: in rule 4 the other two Monthly Issue colours written as literals, `rgb(141_141_135/A)` (paper-mute) and `rgb(255_212_0/A)` (highlight), map the same way to `--color-faint-foreground` and `--color-highlight`; and rule 3's pairs were applied by hand where the fill and the type sit in sibling strings of one `cn()` (the Rarity chip and label, the Provider badge and tabs, the starburst).

### 1. Names

| Palette name | Token | Value | What it is |
| --- | --- | --- | --- |
| `ink` | `background` | `#0b0b0d` | The page ground; as type or a stroke, the inverse of `foreground` (dark type on a light fill) |
| `ink-2` | `card` | `#141417` | Raised panels, cards, search fields, the sidebar |
| `ink-3` | `muted` | `#1d1d22` | Wells inside panels, cover placeholders, hover fills |
| `rule` | `border` | `#2a2a31` | Hairlines |
| `rule-strong` | `border-strong` | `#3a3a43` | Input strokes, dashed empty states, the scrollbar thumb |
| `paper` | `foreground` | `#f4f4f0` | Primary type, the 2px heading rule; as a fill, the inverse surface |
| `paper-dim` | `dim-foreground` | `#b9b9b2` | Body copy, blurbs, inactive nav, secondary labels |
| `paper-mute` | `faint-foreground` | `#8d8d87` | Meta, counts, crumbs, placeholders |
| `highlight-ink` | `highlight-muted-foreground` | `#3a3200` | Secondary type on a highlight fill |
| `destructive-ink` | `destructive-foreground` | `#2a1300` | Type on a solid destructive fill |

`paper-dim` and `paper-mute` do not map to shadcn's `muted-foreground`: that token is `#9a9a93`, between the two, and the primitives use it, so it stays as it is. The same goes for `input` (`#3a3a43`, the primitives' input stroke): a `rule-strong` stroke maps to `border-strong`, never to `input`.

### 2. How a class is rewritten

A class is rewritten when its utility (after its variants, `!` and `-`) is a colour utility followed by a palette name: `bg`, `text`, `border` and its sides (`border-x|y|t|r|b|l|s|e|bs|be`), `ring`, `ring-offset`, `inset-ring`, `outline`, `divide`, `fill`, `stroke`, `from`, `via`, `to`, `decoration`, `caret`, `accent`, `placeholder`, `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow`. These are the same utilities `structure/no-palette-colors` checks.

Only the palette name changes. Variants, `!`, the opacity modifier and any arbitrary opacity are kept as they are:

- `bg-paper/8` becomes `bg-foreground/8`, `outline-paper/12` becomes `outline-foreground/12`, `bg-paper/[0.018]` becomes `bg-foreground/[0.018]`.
- `md:hover:!border-rule-strong` becomes `md:hover:!border-border-strong`.
- `border-b-rule` becomes `border-b-border`, `text-ink-3` becomes `text-muted`.

Match the longest name first (`ink-2` before `ink`, `paper-mute` before `paper`), and never rewrite inside a longer name: `text-highlight-ink` is rule 1's `highlight-ink`, not `ink`.

### 3. Type on a club fill

`text-ink` (with any opacity) usually sits on a light fill, and some of those fills are club or fixed colours that carry their own type colour. When the same string (one string literal, or one static part of a template literal) holds `text-ink` and one of these fills under the same variants, `text-ink` takes the fill's pair instead of `text-background`:

| Fill in the same string | `text-ink` becomes |
| --- | --- |
| `bg-highlight` (any opacity) | `text-highlight-foreground` |
| `bg-rarity-*` | `text-rarity-foreground` |
| `bg-provider-*` | `text-provider-foreground` |
| the `foil` utility | `text-foil-foreground` |

Likewise `text-white` next to `bg-gotm` becomes `text-gotm-foreground`, and next to `bg-nr` becomes `text-nr-foreground` (not a palette name, but the pair a Theme recolours). Anywhere else `text-ink` is `text-background`. All of these hold `#0b0b0d` (or `#ffffff` for the GOTM and NR pairs) today, so the choice changes nothing on this Theme; it only decides what another Theme can reach.

### 4. CSS variables and colour literals

- `var(--color-<palette name>)`, in arbitrary values or inline styles, becomes `var(--color-<token>)` by the table in 1 (for example `[-webkit-text-stroke:1.5px_var(--color-paper-mute)]` becomes `[-webkit-text-stroke:1.5px_var(--color-faint-foreground)]`). Every token is also a `--color-*` variable (the token map is `static`).
- Inside arbitrary values, `rgb(11_11_13)` becomes `var(--color-background)`, and `rgb(11_11_13/A)` becomes `color-mix(in_oklab,var(--color-background)_P%,transparent)` with P = A x 100 (the legibility scrims and the 2px dark rings). `rgb(244_244_240/A)` becomes the same with `--color-foreground` (the 1px paper outline on covers).

### 5. Left as they are

- Club colour names that are already tokens: `gotm`, `gotm-soft`, `nr`, `nr-soft`, `highlight`, `rarity-*`, `ok`, `news-*`.
- Fixed colours: `provider-*`, `tier-*`, `brand-*`, the game tint and its contrast pair in `lib/achievements/tint-color.ts`.
- Per-feature ink lists held as hex in `lib/` (the journal member inks in `lib/journals.ts`, the platform inks in `lib/giveaways.ts`, the suggestion inks in `lib/suggestions.ts`). They are content colours, not palette names; moving them into the Theme is a separate decision.
- `text-white`, `bg-white` and `black` outside the pairs in 3.

### 6. Every palette class the codemod met

Generated from the code at `651156a` (feat/web-structure-www, after www#82 and www#87): every distinct palette class, by utility and modifier, with its rewrite before rule 3 and its count of uses. Classes with variants (`hover:`, `md:`, `group-hover/x:`) follow the same row.

| Class | Becomes | Uses |
| --- | --- | --- |
| `bg-ink` | `bg-background` | 43 |
| `bg-ink/10` | `bg-background/10` | 6 |
| `bg-ink/15` | `bg-background/15` | 1 |
| `bg-ink/18` | `bg-background/18` | 1 |
| `bg-ink/25` | `bg-background/25` | 2 |
| `bg-ink/70` | `bg-background/70` | 5 |
| `bg-ink/75` | `bg-background/75` | 2 |
| `bg-ink/82` | `bg-background/82` | 1 |
| `bg-ink/85` | `bg-background/85` | 9 |
| `bg-ink/95` | `bg-background/95` | 1 |
| `border-ink` | `border-background` | 12 |
| `border-ink/20` | `border-background/20` | 2 |
| `border-ink/45` | `border-background/45` | 1 |
| `caret-ink` | `caret-background` | 2 |
| `from-ink` | `from-background` | 3 |
| `outline-ink` | `outline-background` | 1 |
| `outline-ink/70` | `outline-background/70` | 2 |
| `ring-ink` | `ring-background` | 3 |
| `ring-ink/20` | `ring-background/20` | 1 |
| `ring-ink/30` | `ring-background/30` | 1 |
| `ring-ink/40` | `ring-background/40` | 2 |
| `text-ink` | `text-background` | 80 |
| `text-ink/55` | `text-background/55` | 2 |
| `text-ink/60` | `text-background/60` | 1 |
| `text-ink/70` | `text-background/70` | 4 |
| `text-ink/75` | `text-background/75` | 1 |
| `bg-ink-2` | `bg-card` | 112 |
| `from-ink-2` | `from-card` | 2 |
| `ring-ink-2` | `ring-card` | 1 |
| `bg-ink-3` | `bg-muted` | 124 |
| `bg-ink-3/60` | `bg-muted/60` | 3 |
| `border-ink-3` | `border-muted` | 1 |
| `text-ink-3` | `text-muted` | 3 |
| `bg-rule` | `bg-border` | 5 |
| `border-rule` | `border-border` | 146 |
| `border-b-rule` | `border-b-border` | 1 |
| `divide-rule` | `divide-border` | 1 |
| `ring-rule` | `ring-border` | 2 |
| `bg-rule-strong` | `bg-border-strong` | 7 |
| `border-rule-strong` | `border-border-strong` | 118 |
| `border-t-rule-strong` | `border-t-border-strong` | 1 |
| `decoration-rule-strong` | `decoration-border-strong` | 1 |
| `outline-rule-strong` | `outline-border-strong` | 1 |
| `ring-rule-strong` | `ring-border-strong` | 1 |
| `text-rule-strong` | `text-border-strong` | 1 |
| `bg-paper` | `bg-foreground` | 42 |
| `bg-paper/[0.018]` | `bg-foreground/[0.018]` | 1 |
| `bg-paper/6` | `bg-foreground/6` | 3 |
| `bg-paper/8` | `bg-foreground/8` | 10 |
| `bg-paper/10` | `bg-foreground/10` | 3 |
| `bg-paper/12` | `bg-foreground/12` | 2 |
| `bg-paper/15` | `bg-foreground/15` | 1 |
| `bg-paper/25` | `bg-foreground/25` | 1 |
| `bg-paper/35` | `bg-foreground/35` | 1 |
| `bg-paper/90` | `bg-foreground/90` | 2 |
| `border-paper` | `border-foreground` | 58 |
| `border-paper/15` | `border-foreground/15` | 1 |
| `border-paper/30` | `border-foreground/30` | 1 |
| `border-t-paper` | `border-t-foreground` | 2 |
| `decoration-paper/30` | `decoration-foreground/30` | 1 |
| `fill-paper` | `fill-foreground` | 1 |
| `from-paper` | `from-foreground` | 1 |
| `from-paper/20` | `from-foreground/20` | 1 |
| `from-paper/60` | `from-foreground/60` | 1 |
| `outline-paper/12` | `outline-foreground/12` | 1 |
| `ring-paper` | `ring-foreground` | 2 |
| `ring-paper/30` | `ring-foreground/30` | 1 |
| `text-paper` | `text-foreground` | 260 |
| `text-paper/90` | `text-foreground/90` | 3 |
| `to-paper/[0.06]` | `to-foreground/[0.06]` | 1 |
| `via-paper/20` | `via-foreground/20` | 1 |
| `bg-paper-dim` | `bg-dim-foreground` | 4 |
| `text-paper-dim` | `text-dim-foreground` | 290 |
| `to-paper-dim` | `to-dim-foreground` | 1 |
| `bg-paper-mute` | `bg-faint-foreground` | 3 |
| `bg-paper-mute/60` | `bg-faint-foreground/60` | 2 |
| `border-paper-mute` | `border-faint-foreground` | 26 |
| `border-paper-mute/60` | `border-faint-foreground/60` | 1 |
| `border-paper-mute/70` | `border-faint-foreground/70` | 1 |
| `decoration-paper-mute/60` | `decoration-faint-foreground/60` | 2 |
| `ring-paper-mute` | `ring-faint-foreground` | 1 |
| `text-paper-mute` | `text-faint-foreground` | 464 |
| `text-paper-mute/60` | `text-faint-foreground/60` | 1 |
| `text-paper-mute/70` | `text-faint-foreground/70` | 2 |
| `text-paper-mute/80` | `text-faint-foreground/80` | 1 |
| `text-highlight-ink` | `text-highlight-muted-foreground` | 17 |
| `text-destructive-ink` | `text-destructive-foreground` | 1 |

## Design rules

The Monthly Issue's own rules. They sit on top of the Theme floor in `DESIGN.md` (contrast, focus, reduced motion, target size), which every Theme meets. Colours are named by their tokens (`background`, `card`, `foreground`...), which is what code and design work use. The plain words in the prose (ink, paper, rule) are this Theme's display names for them: Ink is `background` (Ink 2 `card`, Ink 3 `muted`), Paper is `foreground` (Dim Paper `dim-foreground`, Mute Paper `faint-foreground`), Rule is `border` (Strong Rule `border-strong`); "ink type" on a club colour is that colour's `-foreground` pair (`highlight-foreground`, `rarity-foreground`, `provider-foreground`, `foil-foreground`).

### Overview

**Creative North Star: "The Monthly Issue"**

Every Game of the Month round is an issue of the club's own 90s game magazine. The GOTM winner is the cover story, the Non-RPG pick is the feature, the club's open business (nominations, the vote) is a highlighter-yellow insert, and every other page is a department: GOTM history is the archive, a member's profile is their bookcase, a game page is its own cover story. The voice is loud and printed: ink-black stock, condensed caps set big, three spot inks that each mean one thing.

Density is magazine density, not dashboard density. A page leads with one monumental object (a round number, a game's two-line headline, a member's name in Anton at banner scale), then settles into ruled departments with labels in tracked condensed caps. Surfaces are hard rectangles with barely-there corners. Depth comes from key art under black legibility scrims, not from glowing cards.

The world refuses the default dark game-tracker: gradient-faded key-art cards, glow accents, gradient text. The Theme is dark (`data-mode="dark"`, theme colour #0b0b0d).

**The Achievement Hub department.** Achievements are the magazine's collectors' department. A member's achievements are a binder opened on its gutter, each Achievement Set is a page or a two-page spread inside it, and the community hub is a wall of the club's Unlocks pinned up under paper-tape day labels. The department keeps the ink ground, Anton and Barlow, and the 2px paper rules, and it brings its own colour roles (game tint, Rarity inks, Provider colours, foil) that appear on achievement surfaces only. The binder refuses the tracker default of a stats header over a grid of progress cards. Icons are die-cut objects resting in slots, locked Achievements are dashed numbered slots, and hidden ones are sealed tiles.

**The Challenges department.** Challenges are the magazine's fun department: a pinboard of club flyers, each in the Challenge's own tint, with the running ones pasted up as billboards over monumental day counts. A Challenge's page is a cover story (key art over its tint under the scrim, the name as a two-line headline whose second line takes the tint's hi) with every member's Run beneath it and The Pool one switch away, and its rules are written as one sentence of underlined words. The department keeps the ink ground, Anton and Barlow, and the 2px rules, and it brings its own colour roles (the Challenge tint, the Format inks, holly and tinsel) that appear on Challenges surfaces only. It refuses the uniform card grid, the stats header over a progress table, and the long stacked form.

**The News Hub department.** The club's news is the magazine's contact sheet. Every News Item is a frame of its art marked in its News Category's ink, and the frames are laid out by UTC day under Anton day headings. The department keeps the ink ground, Anton and Barlow, and the 2px rules, and it brings one colour role of its own (the News inks) that appears on news surfaces only. It refuses the news-site headline list and the dashboard default of stats over a wall of cards.

**Key Characteristics:**
- Ink-black ground with three spot inks: masthead red for GOTM, violet for NR-GOTM, highlighter yellow for the member's own business.
- Anton in caps for every headline and numeral, Barlow Condensed tracked caps for every label, Barlow for reading.
- Monumental numerals: the round number, a shelf's count, the days-left clock.
- The winner starburst, stamped once, only on winners.
- Two-line game headlines, with the second line in the track's accent.
- Hard rectangles (2-4px corners) and 2px paper rules under headings.
- In the Achievement Hub: game-tint spines, bands and tabs; die-cut icons edged in their Rarity ink; foil stamps only for Platinum, Mastery and Completion.
- In the News Hub: frames of art with a foot bar and a corner tag in the News Category's ink.
- In Challenges: flyers and banners in each Challenge's tint with paper type, a Format's 9px ink square, and rules written as a sentence of underlined words.

### Colors

An ink-black stock printed with off-white paper type and three spot inks, each owned by one meaning.

#### Primary
- **Masthead Red** (gotm): the GOTM track's ink. GOTM chips, the GOTM round numeral, GOTM winner tags (A/B/C), the primary "View game" button on a GOTM cover, the 3-4px foot bar under a GOTM pick's art, the running-head separators, the active sidebar item and the sidebar's you-are-here marker, and the "RPG" in the wordmark. It is sampled from the club logo (exactly #ff0000; the `brand-50..950` scale in globals.css is its tonal ramp).
- **Soft Red** (gotm-soft): GOTM track labels set as small type on ink, where full red would vibrate.

#### Secondary
- **Feature Violet** (nr): the NR-GOTM track's ink. NR chips, the NR button, the 4px top rule of the NR feature card, NR foot bars, the NR starburst fill, and the NR round numeral on a promoted cover.
- **Soft Violet** (nr-soft): the NR headline's second line, NR labels and NR stat accents on ink.

#### Tertiary
- **Highlighter Yellow** (highlight): the member's own business. As a fill: calls to action (the nominations/voting round panel, the voting ballot strip, the review compose panel, the imports panel, the landing's join band, the `highlight` button and chip, the sidebar's voting badge and the Play group's open-round dot, "Your pick") and the GOTM starburst. As type or a line: the GOTM headline's second line, link and card-title hover, the focus ring, text selection, the input caret, and the border of an editor panel that is open for the member's own edits.
- **Yellow Ink** (`highlight-muted-foreground`): secondary text set on a yellow panel (bylines, small print).

#### Neutral
- **Ink** (`background`): the page ground and the base of every scrim.
- **Ink 2** (`card`): raised panels, cards, search fields and the sidebar.
- **Ink 3** (`muted`): wells inside panels, cover placeholders, hover fills.
- **Rule** (`border`): hairlines, top-bar and sidebar borders.
- **Strong Rule** (`border-strong`): input strokes, dashed empty-state borders, the scrollbar thumb.
- **Paper** (`foreground`): primary type, and the 2px rule under every page and section heading.
- **Dim Paper** (`dim-foreground`): body copy, blurbs, inactive nav and secondary labels.
- **Mute Paper** (`faint-foreground`): meta, counts, parent crumbs, placeholders and the cover-fallback title.
- **Signal Orange** (destructive): destructive actions only. It is chosen to sit off both red and yellow, so a destructive action never reads as a track or a call to action.
- **Orange Ink** (`destructive-foreground`): type on a solid signal-orange fill (the confirmed destructive button). Paper type on orange misses AA; this near-black brown clears it.
- **Done Green** (ok): the Done stamp, dot and check on the staff production desk only. A mark, never a fill behind type, and never on member surfaces. See the Production desk section for why it shares the uncommon Rarity ink's hex.

#### Named Rules
**The One Ink Per Track Rule.** Red means GOTM, violet means NR-GOTM, and nothing decorative borrows either. A GOTM element never wears violet and an NR element never wears red. A game that won both tracks reads as GOTM first.

**The Yellow Is Yours Rule.** Highlighter yellow is filled only for calls to action and the GOTM starburst. As type it marks the GOTM headline's second line and interaction states (hover, focus, selection, caret). It never fills a decorative panel.

**The Red Is Also Here Rule.** Besides GOTM, masthead red marks where you are: the active sidebar item, the 3px marker beside a sidebar group's row while you are on one of its unpinned pages, the running-head separators and the running tick of the /join slideshow. It marks nothing else, with one sanctioned exception on the staff desk: the Off state of a Feature Flag (see the Off Red Rule).

#### Achievement roles (achievement surfaces only)
The Achievement Hub adds four roles to the palette. They live on achievement surfaces only (the member achievements page, set pages, the hub, the profile's Achievements section and the game page's achievements) and never leave them. (The staff desk's done green `ok` shares the uncommon ink's hex as a token of its own; see the Desk Green Rule.) On these surfaces, red appears only as "you are here" in the shell, violet never appears, and yellow stays with calls to action and interaction states.
- **Game tint** (sampled, not a token): each Achievement Set's colour, taken from the vivid dominant hue of its cover (or its set icon), clamped to a vivid-but-not-neon, mid-lightness range, and darkened until ink or paper type on it clears 4.5:1. A set without usable art gets a hashed tint from a curated list kept away from the GOTM red and the NR violet. It is a set's spine, its title band, its view and index tabs, its slot numbers and slot dots, its progress bar, and the seal across a hidden tile.
- **Rarity inks** (rarity-common, rarity-uncommon, rarity-rare, rarity-ultra): the 3px die-cut edge of an unlocked icon, the Rarity chip fills, and the Rarity tally bars, by the Provider's overall Rarity: common at 50% and above (`foreground`), uncommon 15-50% (green), rare 5-15% (blue), ultra rare under 5% (hot pink). Ultra rare is the Highlight line, so hot pink also prints an ultra-rare Unlock's odds tag.
- **Provider colours** (provider-retroachievements, provider-steam, provider-psn): solid Provider chips and Linked Account chips, Provider filter tabs, and a 3px top rule on Provider pages and cards, always with ink type. A deselected Provider chip drops to a 1.5px inset outline in its colour. PlayStation is lifted from #3b6fe0 so ink type on it clears AA.
- **PSN tier metals** (tier-bronze, tier-silver, tier-gold): the small corner dot on a PSN trophy's icon. The Platinum dot is foil.
- **Foil** (sidecar `foil`): a holographic conic edge (#b9f3ff, #ffd6f5, #fff3b0, #c7ffd9) under a soft diagonal white sheen, always with ink type.
- **Member ring colours**: on a game's club page, each member holding an Achievement is a dot on the ring around its icon, in one of eight muted colours held under the Rarity inks and off all three track inks.

**The Game Art Is Content Rule.** A game tint is sampled from the game's own art, so, like key art, it is exempt from the One Ink Per Track Rule: a red or violet tint never means GOTM or NR-GOTM. The system's own tints (the hashed fallbacks) stay off red and violet so a game without art never reads as a track.

**The Tint Carries Its Type Rule.** A tint never travels without its contrast colour. Type on a tint is ink or paper, whichever clears AA, and a tint band is always solid, never a gradient.

**The Foil Is Earned Rule.** Foil is the system's single sanctioned gradient. It marks only Platinum, Mastery and Completion: the foil stamp, the foil die-cut edge on the Unlock behind one, the Platinum tier dot, the foil frame behind a Platinum on a game's club page, and a Completion signed in the margin. It never sets text, and it never decorates.

#### Journal member inks (journal surfaces only)
The Game Journal gives each member a colour of their own, so their run reads at a glance on the game page's chronology plate (the line and dots) and on the /journals shelf (the cap of their spine). It is picked from the member's Discord id, so a member wears the same ink on every journal surface. The six inks are fern #6dd17f, lagoon #43d3cc, orchid #f077c0, sky #86d3f6, peony #fab6ba and cornflower #719def. They are marks, never fills behind type: each clears 6:1 against `card` and `muted`, so a dot or line holds well past the 3:1 non-text minimum.

**The Journal Ink Is a Person Rule.** A journal ink means one member and nothing else. The inks stay off masthead red, feature violet, highlighter yellow and signal orange, so a journal line never reads as a track, a call to action or a destructive action, and the yellow ring on a selected dot stays the only interaction mark. They do not borrow the Achievement roles (the member ring colours stay on achievement surfaces), and they never leave journal surfaces.

#### Challenges inks (Challenges surfaces only)
Challenges are the magazine's fun department, so they bring their own colour, and it stays on Challenges surfaces: the index, the Challenge page (Pool, Slots, Assignment), the create and edit form, the Santa pick page and the Runs section of a profile. The main role is each Challenge's own tint; the Format inks are only small markers.
- **Challenge tint** (data, not a token): each Challenge has one tint, used as a pair, stored on the Challenge by the API (`tint: { fill, hi }`) so the bot and the site agree, and read through `challengeTint()` in lib/challenges/tint.ts. A surface sets it as `--challenge-tint` and `--challenge-tint-hi` on its card or page root.
  - **fill**: the flyer, the billboard, the banner's ground behind its art, a Finished stamp, the tint chip. All type on a fill is paper (body copy included, never `dim-foreground`) and clears 4.5:1.
  - **hi**: the same hue lifted for type and marks on ink: the banner's second headline line and its days-left numeral, the view-switch underline, Run bars, the Finished stamp on ink, open-year numbers and birth-year rings on a Slots Run. It clears 4.5:1 on `background` and `card`.
  - **Curated tints** (fill / hi): teal #1f6b67 / #6fd6cc, cobalt #2c4f8e / #9ab8f2, holly #1c6545 / #3fbf8a, umber #7a531c / #e0b56e, moss #3b5a2b / #a9cf86, azure #2a5ea6 / #9cc2f5, slate #3a3a52 / #b4b4d6, ochre #8a6417 / #e6c36a. A new Challenge gets one (holly for Secret Santa, the other seven turning by id); the Host or staff may set another pair that keeps its type readable. Paper on fill measures 4.9-10:1, hi on ink 9.8-11.6:1.
  - **Muted (Closed / Expired):** the fill mixed 35% (a Closed flyer) or 30% (an Expired stamp) into `muted`, with paper titles and `dim-foreground` body.
- **Format inks** (format-slots, format-pool, format-assignment): small markers only, never a fill behind more than a word. A 9px square beside the Format's name in a flyer's label, in the index's Format filter, on the banner's Format chip, on the form's Format cards and on a profile stamp. They never colour a card, a bar or a heading.
- **Holly and tinsel** (holly, tinsel; Secret Santa only): holly #3fbf8a is Secret Santa's tint hi (its fill is #1c6545) and marks the Edition's key days. Tinsel #e9c46a is the door edge, the name-tag string and the reel rule. Neither appears on another Challenge.

**The Tint Is the Challenge Rule.** A Challenge tint means that Challenge and nothing else. Like a game tint it is content, so a red or violet tint never means GOTM or NR-GOTM, but the curated tints stay off masthead red, feature violet, highlighter yellow and signal orange. Yellow still means your own business (your Run's ring, Start a Run, Sign up, the word being edited, New Challenge), signal orange still means Abandon and Delete, and red is still only "you are here". The Tint Carries Its Type Rule applies: a tint fill always travels with paper type and is always solid. The only gradient on a Challenge surface is the black legibility scrim over banner art.

#### News inks (news surfaces only)
The News Hub gives each News Category an ink of its own, so a card's category reads before its headline. The inks live on news surfaces only: the News page, its cards and its filter, and the category switches on /settings. They are marks, chips and bars (a card's 4px foot bar and corner tag, the 16px square beside a category's name), never a panel. Type on an ink is ink, and each ink clears 5:1 against ink, `card` and `muted`. Only five hues fit between the reserved inks (masthead red, feature violet, highlighter yellow and signal orange), so Hardware is a tan and the last two are neutrals told apart by stroke.
- **Announcements** (news-announcements): magenta, for Announcements & Trailers.
- **Releases** (news-releases): lime, for Releases & Updates.
- **Emulation** (news-emulation): teal, for Emulation & Preservation.
- **Industry** (news-industry): blue.
- **Hardware** (news-hardware): tan, for Hardware & Platforms.
- **Rumours** (news-rumours): cool grey, for Rumours & Leaks, always drawn dashed because the news is unconfirmed (a dashed foot bar, a dashed inner outline on its tag and square).
- **General** (news-general): `faint-foreground`'s grey, for General and for any item whose category the page does not know.

**The News Inks Stay on News Surfaces Rule.** A News ink means one News Category and nothing else, and it never leaves news surfaces. The inks do not borrow or lend to the Achievement roles or the Journal member inks: magenta sits near rarity-ultra and teal near the RetroAchievements Provider colour, but they never share a surface, so neither can be misread. Read them through `newsInk()` in lib/news.ts, which also says when to dash.

#### Region inks (release surfaces only)
A Release is one platform in one region, and the region chip beside its date carries the region's ink, so "which date is mine?" reads at a glance. The inks live on release surfaces only: the game page's Releases section and the Release Calendar. They are chip fills with ink type (Badge tones `region-na`, `region-eu`, `region-jp`), each clearing 9:1 against its type and against ink.
- **North America** (region-na): periwinkle.
- **Europe** (region-eu): mint.
- **Japan** (region-jp): pink.
- **Worldwide** (Badge tone `region-ww`): no ink, a 1.5px paper stroke with paper type.
- **Any other region** (Badge tone `region`: Australia, New Zealand, China, Asia): a 1.5px dim stroke with paper type, so only the three big release regions wear a colour.
- **Past:** once a Release's period has ended, its region chip drops to a 1.5px outline in its ink with that ink as type (`data-past`, like an unpicked Provider chip), and Worldwide to a faint stroke and faint type, while the row's type goes faint.
- **Date Precision is never a hue.** A vague date carries the `precision` Badge tone, a dashed `faint-foreground` outline with dim type, saying what is still unknown: "Day TBA" beside "Dec 2026", "Month TBA" beside "Q3 2027" or "2027", and "No date yet" for TBA. An exact day takes no chip.

**The Region Ink Is a Place Rule.** A region ink means one release region and nothing else. It never marks a platform, a Date Precision or a game, and the inks stay off masthead red, feature violet and highlighter yellow, so a region never reads as a track or a call to action.

#### Club Codex inks (Club Codex surfaces only)
The Club Codex has two small ink sets, and each set answers one question. The **part inks** say which part of the Club Codex something belongs to (Club History, Club Lore, Fun Facts). The **History Event Kind inks** say what sort of History Event it is. They live on Club Codex surfaces only: /codex, /codex/history (and its front-page band), /codex/lore and each Lore Entry page, /codex/fun-facts, and the Lore Entry and History Event forms. The bot's posts use the same hexes, so a colour means the same thing in Discord and on the site.
- **Club History parchment** (codex-history): the Club History door on /codex and a History Event's square in its contents list.
- **Club Lore jade** (codex-lore): the Club Lore door; a Lore Entry page's second headline line, date stamp, drop cap, heading underbar, pull quote and See also band; jade spines, an ink spine's 6px cap and the slide-out's top tab on the shelf.
- **Fun Facts pink** (codex-fact): the Fun Facts door; the Fun Fact panel's 4px top rule and heading on /codex; the index cards on the wall; the inline add panel's 3px top rule and label, and the "Next Daily Fun Fact" tag.
- **Fun Facts pale pink** (codex-fact-light): every third index card on the wall, so the wall is not one flat pink. Nowhere else.
- **Jade deep** (codex-lore-deep) and **jade print** (codex-lore-print): small dark type on the jade See also band and on a taped photo's paper mount.
- **Kind inks** (kind-founding rose, kind-staff lagoon, kind-platform sky, kind-rules lime, kind-milestone parchment): only where a History Event shows its Kind: the 10px dot and Kind label on the timeline, the Kind filter chips (an outline in the ink, filled when selected), the Kind tiles on the History Event form, the front page's founding-year numeral, and in Discord the accent of each History Event in `/codex history`. A Kind ink is a dot, a label, an outline, a selected chip or a selected tile, never the ground of a card or a chapter.

Ink type on every part and Kind fill clears 9.3:1 or more; each ink as type or a mark clears 9.3:1 on `background`, 8.6:1 on `card` and 7.9:1 on `muted`.

The Fun Facts wall is a corkboard of index cards: each card in the Fun Facts ink with ink type, ruled like an index card (a 1px ink line at 13% every 28px, starting 46px down, under "No. 42" in Anton and the date in label type over a 2px ink rule), a strip of paper tape across its top, and a slight tilt picked from the Fun Fact's id so it never moves between visits. The Fun Fact reads in Barlow 500 at 17px on the rules, mentions as linked member names with a 55% ink underline; the foot holds "by Name" in label type, an ink "Read the story" chip when the Fun Fact tells a Lore Entry's story, and underlined Edit and Delete for whoever may.

**The Part Ink Is the Part Rule.** A part ink means that part of the Club Codex and nothing else. Club History parchment shares its hex with Milestone parchment on purpose: they never meet as different meanings, because the timeline uses Kind inks only and the part inks never appear on it.

**The Kind Ink Is the Kind Rule.** Kind inks appear only where a History Event shows its Kind.

**The Fill Carries Ink Type Rule.** Every part-ink and Kind-ink fill (door, spine, index card, See also band, selected chip, selected tile) carries `background` ink type, body copy included (a door's body at ink 82%, its small labels at ink 70%). Paper type never sits on these fills. On ink grounds the inks are type, rules and marks. Yellow is still yours (Add, Save changes, the picked spine's ring, the lit mention row, focus and the caret), signal orange is still only Delete, and masthead red is still "you are here": no Codex ink borrows red, violet, yellow or orange. Fun Facts pink sits near `news-announcements` and `rarity-ultra`, and Staff lagoon near the Journal ink lagoon and `news-emulation`; they never share a surface, so neither is misread, and one is never reused for the other.

### Typography

**Display Font:** Anton (with Impact, sans-serif), loaded at weight 400 only
**Body Font:** Barlow (with system-ui), 400-700 with italic
**Label Font:** Barlow Condensed, 500-800

**Character:** Anton is a caps-only poster face that does the shouting: headlines, numerals and stats. Barlow Condensed in tracked caps is the magazine's furniture: nav, chips, buttons, meta. Barlow carries the reading. Numerals are tabular everywhere (`font-variant-numeric: tabular-nums` on body).

#### Hierarchy
- **Numeral** (Anton 400, 5.75rem, line-height 0.8, -0.01em): the monumental round number on a cover, a ledger row or a previous-rounds strip; the counts that head profile shelves; the days-left clock. Set in the track's ink where a track owns it.
- **Display** (Anton 400 caps, 3.75rem phone to 5.75rem desktop, line-height 0.9): a single winner's cover headline (capped at 11ch) and the hero names on game and member banners.
- **Headline** (Anton 400 caps, 3rem to 3.75rem): page titles (`PageHeader`), sitting on a 2px paper rule with a count beside them.
- **Title** (Anton 400 caps, 1.875rem): section headings inside a page (`SectionHeading`), also on a 2px paper rule; feature-card and panel titles run 1.45-2rem.
- **Body** (Barlow 400, 1rem, about 1.5): blurbs and reviews, measure 48-68ch (65ch for page descriptions). Review headings lean on Barlow italic.
- **Label** (Barlow Condensed 700-800 caps, 0.8-1.05rem, 0.06em tracking, 0.08em for meta): nav, buttons (0.95rem, 800), running head (0.95rem, 0.08em), stats labels and links.
- **Chip** (Barlow Condensed 700 caps, 0.78rem, 0.06em tracking): fact and track chips.

#### Named Rules
**The Two-Line Headline Rule.** A game's title breaks at its subtitle colon ("Metaphor:" / "ReFantazio"). Without a colon it breaks before the last word, and a one-word title is all second line. The second line takes the track's accent: yellow for a GOTM winner, soft violet for an NR-GOTM winner, paper for everything else. Every page that sets a game's name as a headline uses this one rule.

**The Caps Are the Face Rule.** Anton and Barlow Condensed are always set in caps through the `font-headline` and `font-label` utilities. Anton never sets mixed case, and it never sets body text.

**The Earned Over Total Rule.** In the Achievement Hub a count reads as an Anton numeral with its total beside it in `faint-foreground` ("23 / 41"): a set header sets it at numeral scale, the binder index and club pages at 1.25-1.5rem. A member's Unlocks are the binder's monumental numeral (4.5rem to 5.25rem), with Completions, Masteries, Platinums and RA points as 2rem Anton over label captions. Slot numbers are two-digit Anton ("07").

### Layout

The app shell is a left sidebar (collapsible to icons; an off-canvas sheet on phones) beside a 60px sticky top bar (ink at 95% with a light backdrop blur and a rule beneath), with page content under it. Content gutters are 16px on phones and 28px from `sm`, with 24px top padding. Content spans the area beside the sidebar up to one shared maximum of 120rem (the `--container-page` token, `max-w-page`) and centers past it; the frame owns that width, so pages don't set their own outer width. Full-bleed banners (game hero, game strip, review banner) use the `bleed` utility to break out of the frame to the full width beside the sidebar. Only limits that serve one piece of content (a reading measure, a diagram, a podium, a small callout) cap their own width. Departments stack 40px apart. Grids use 20px gaps; tight clusters (chips, links) use 6-8px.

The dashboard is a two-column issue from `lg`: the cover story fills the flexible column and a 23rem right rail holds the NR feature over the yellow round panel. The previous-rounds strip runs below. Below `lg` everything stacks.

**The Empty Track Rule.** A track with no winner gives its space away rather than apologising for it. On the dashboard, with no NR-GOTM the yellow round panel takes the whole right column at full height and lists the latest nominations. With no GOTM, the NR-GOTM is promoted to the cover in violet, with one small "No Game of the Month this round" note under the numeral. In the GOTM history ledger, where rows must align, an absent track keeps its column as a dashed `border-strong` box with a short muted label. Under a title search, that box stays silent, because absence there means "no match".

**The Multi-Winner Rule.** Co-winners share one cover, never a carousel. Two winners split it (1.42fr / 1fr). Three put a tall lead panel beside two stacked panels (1.3fr / 1fr). The lead carries the numeral, a paper "N winners" tag and every outbound link, and the narrow panels keep two links. Each winner gets a square letter tile (A, B, C) in its track's ink, and titles step down by panel size. The NR rail does the same: one winner is a feature card, and two or three are a ranked list of covers with A/B/C letters. Side-by-side panels reserve equal blurb height so their stats and actions sit level.

**The Open Binder Rule.** A member's achievements open as a binder: a rule-coloured cover with 4px corners and a deep object lift, holding two `card` pages. From `xl` it is a 25rem left page (the member, their totals, Linked Accounts and four rarest Unlocks), a 30px gutter of rings, and the index page. Filter tabs (status, then one per Linked Account's Provider) sit on the binder's top edge, and each index row's game-tint tab sticks out past the binder's right edge. Below `xl` the binder closes to one page with the member first and the index below.

**The Spread Rule.** A set page is a two-page spread: from `xl` the left page (1.7fr) holds the view (Checklist, Rarity or Timeline) and the right page (at least 20rem) holds the picked Achievement's details over the Rarity tally, sticky under the top bar. The pages meet at a shadowed gutter. Game-tint view tabs sit on the spread's top edge. On phones the spread closes to one page and the details open under the picked item.

**The Day Band Rule.** The hub runs newest first in UTC day bands, each headed by a paper-tape label with a rule running out to its tally. From `xl` the Latest wall takes 62% beside a 38% rail of this week's Highlights. The wall is two columns from `sm`, and a card holding a Highlight spans both, as does a day's odd card out, so the wall never ends on a hole. The Highlights wall alone runs 2 to 6 columns without day bands, each tag carrying its own date.

**The Contact Sheet Rule.** The News page puts a 15.5rem category rail beside the card grid from `lg`, sticky under the top bar, with a 28px gap. Below `lg` the rail becomes a "Filter" outline-button disclosure above the grid holding the same list. The grid runs newest first in UTC day bands: each is headed by an Anton title ("Today", "Yesterday", or a date like "Sun 8 Nov", with the year added when it is not this year), a label-type date and item count in `faint-foreground`, and a 2px `border-strong` line running out to the edge. The grid's columns follow the width of its own column (a container query, not the viewport): one, then two, then three, with 20px gaps. Numbered pagination sits under the last band, followed by a small label-type "Days and times in UTC" note.

### Elevation & Depth

The system is flat with tonal layering: ink, then `card` for panels, then `muted` for wells. Depth on art surfaces comes from black legibility scrims over full-bleed key art, never from glow. Shadows are soft, black and directional, and they appear only on objects that physically sit on the page: the starburst, a dealt pick card, a member avatar, the lifted cover in a filmstrip, a notice slip, the /join panel.

#### Shadow Vocabulary
- **Stamp shadow** (`drop-shadow(0 6px 14px rgba(0,0,0,0.45))`): the starburst.
- **Object lift** (`box-shadow: 0 12px 30px rgb(0 0 0 / 0.5)` up to `0 24px 60px rgb(0 0 0 / 0.6)`): dealt cards, covers lifted in a reel, the banner avatar, the covers dealt on a /join slide and a notice slip; the /join panel takes the top end.
- **Type-on-art shadow** (`text-shadow: 0 1px 8px rgb(0 0 0 / 0.85)`): small labels sitting directly on key art.
- **Inset ring** (`box-shadow: inset 0 0 0 1-2px <`border-strong` | `faint-foreground` | highlight>`): strokes without layout shift; yellow marks a selection, including the current option in the hub's controls and the picked Achievement in a set view.
- **Die-cut rest** (`0 3px 6px rgb(0 0 0 / 0.45)`, up to `0 8px 16px rgb(0 0 0 / 0.55)` at larger sizes): an unlocked icon sitting on its slot, fanned icons and pinned Highlights. The foil stamp and an odds tag take the stamp shadow's soft drop.
- **Gutter shade** (`inset ±18-22px 0 22-26px -14 to -20px rgb(0 0 0 / 0.7)`): binder and spread pages darken into the gutter where they meet.
- **Tab lift** (`4px 4px 10px rgb(0 0 0 / 0.45)`): an index row's tint tab standing proud of the binder's edge.

#### Named Rules
**The Scrim Not Glow Rule.** Key art is darkened from where the type sits (from the left for a single cover, from the foot for split panels) with ink gradients (`rgb(11 11 13 / 0.96 to 0.15)`). Art is never faded into a coloured gradient, and nothing glows.

### Shapes

The form language is hard rectangles. Chips and tags take 2px (`rounded.xs`). Buttons, inputs, covers and nav items take about 2.4px (`rounded.sm`). Panels and covers take about 3.2px (`rounded.md`), all from a 0.25rem base radius. The only round forms are avatars and status dots. Covers carry a 1px inset paper outline at 12% so dark art holds its edge on ink. Headings sit on a 2px solid paper rule. Spines on profile shelves have slightly uneven, stable heights so a shelf never reads as a bar chart.

**The Die-Cut Rule.** Achievement icons are die-cut objects, so they alone round to 6px (`rounded.die-cut`). The ring frame around a tile on a game's club page follows the cut at 7-8px. Everything else in the Achievement Hub keeps the hard rectangle: chips and stamps at 2px, tabs and tint bands at about 3.2px, the binder cover at 4px. Its round forms are the slot dots, the member ring dots, the PSN tier dot and avatars.

**The Hand-Placed Rule.** Objects that sit on the page rest at a tilt and pages stay square. An unlocked icon takes a stable tilt from its id (within ±1.5deg) and straightens on hover. A foil stamp is pressed at -8deg, an odds tag at 6deg, a day tape at about 1deg alternating, and a hand of fanned icons leans by position. A notice slip is pinned at -2deg, and the covers dealt on a /join slide lean at -2deg, 1.5deg, -1deg and 2deg by position. A hidden tile is sealed by a diagonal band in the game tint, and a day tape has torn edges.

### Components

#### Buttons
Blunt, label-voiced and loud.
- **Shape:** near-square (rounded.sm), 36px tall, 14px side padding, Barlow Condensed 800 caps at 0.95rem, with a 16px icon at the inline end ("View game →") or inline start.
- **Primary (default):** masthead red with white type. It is for GOTM actions only; on hover it drops to 85% red.
- **Highlight:** yellow with ink type, for calls to action (nominate, vote).
- **NR:** violet with white type, for NR-GOTM actions.
- **On a yellow panel:** ink with paper type for the main action, and an ink-outlined transparent button beside it (the Inverse and Inverse outline variants).
- **Inverse:** the page ground as fill on a light object (the yellow panel, a notice slip): ink with paper type, dropping to 85% on hover, with an ink focus ring.
- **Inverse outline:** the second action beside it: transparent with a 1.5px inset stroke in the object's own type colour (ink on yellow) and a 10% wash of it on hover.
- **Outline:** a 1px `faint-foreground`/60 stroke, transparent, paper type; on hover the stroke goes paper and the fill `muted`.
- **Link:** paper type with a 2px red underline offset 4px; it turns yellow on hover.
- **Destructive outline:** a signal-orange stroke with orange type on transparent; on hover a 10% orange wash. It is the button that opens a destructive action's confirm (Delete, Reset votes, Close now).
- **Destructive solid:** signal orange with orange-ink type; on hover it drops to 85%. It is the confirmed destructive action, after the typed-word confirm. Destructive never uses masthead red.
- **Destructive ghost:** a ghost action that removes something; its icon turns signal orange on hover.
- **Overlay:** the outline button sitting on art (a banner, a cover reel), over a 70% ink ground.
- **Selected:** the chosen one of a row of outline buttons (aria-pressed): a paper block with ink type.
- **Done:** an action already taken, standing where its button was (the Santa's "Picked" with a check): the outline's look at full strength, inert.
- **Focus / Active:** a yellow focus ring (3px at 50%); pressing nudges the button down 1px. Outbound text links ("Reddit ↗") are small label-voice links in `dim-foreground` that turn yellow on hover.

#### Chips
- **Style:** 24px tall, 2px corners, 8px padding, chip type. The neutral chip (year, platform, studio, role) is paper at 8% with `dim-foreground` text.
- **Tones:** gotm (red/white), nr (violet/white) and highlight (yellow/ink, for "Your pick" and badges). Only a track's own fact wears its ink. The Badge primitive carries them as `tone`, with inverse (paper/ink), outline (a 1.5px `dim-foreground` stroke), secondary (`muted`), destructive, the four Rarity inks and foil.
- **Preview badge (staff only):** a Preview Feature's pages carry the highlight chip reading "Preview" beside the page title (or leading the header's chip row on a banner), so staff never mistake a Preview page for a Live one. Members never see a Preview Feature, so never the badge.

#### Cards / Containers
- **Corner Style:** rounded.md.
- **Background:** `card` on ink, with an optional 1px rule border. A track is marked by a 3-4px bar in its ink: the NR feature card's top edge, and the foot of a pick's art.
- **Internal Padding:** 16-28px (20px on narrow panels, 28px on the cover from `sm`).
- **Empty states:** a dashed `border-strong` border with a short muted line ("Nothing in progress right now.").
- **Card primitive:** default (`card` with a rule), paper (no rule), active (the yellow rule of the panel being edited or picked) and cover (art in a CardCover under a CardScrim that fades the foot to ink).

#### Inputs / Fields
- **Style:** 36px, `card` fill, 1px rule (or `border-strong`) stroke, rounded.sm, a muted 16px leading icon, and a muted placeholder.
- **Focus:** the stroke shifts to `faint-foreground` (a quick search: a member's Completed list) or yellow with a soft yellow ring (editors). The caret is yellow.
- **Input variants:** inset (an ink field set into an `card` panel), destructive (the armed typed-word confirm: an orange stroke and ring) and inverse (a pale yellow field with ink type on the yellow panel).

#### Navigation
- **Sidebar:** the wordmark in Anton ("The **RPG** Club", with RPG in red), then Dashboard, a **Pinned** heading over the member's Pinned Pages (for now everyone has the club default: Voting, Games, Members, News, less any the viewer isn't shown), and a **Browse** heading over the group rows **Play**, **Games**, **Club** and **Staff** (staff only). The headings are label-type caps at 0.78rem in `faint-foreground`, 38px tall with the caps on the baseline. Rows are 40px tall, label type at 1.05rem in `dim-foreground` with 18px line icons. Hover fills `muted`. The active item is solid masthead red with white bold type. Voting is named for the round's phase (Nominations or Voting) and carries a yellow Open badge while a round is open; for staff, a Preview Feature's item carries a "Preview" badge of the same size in the same slot (clipped on the icon rail, where the tooltip says it). Pages for Features the viewer isn't shown are left out, and so is a group left empty.
- **Sidebar group rows:** one 40px line: icon, name, then on the right the current page's name (label type at 0.875rem, paper) when the viewer is on an unpinned page of that group, which also takes a 3px masthead-red marker in the gutter to the row's left, and a faint chevron that nudges 2px right on hover. Play carries an 8px yellow dot on its icon's corner while the round is open. No page counts.
- **Sidebar drill-in:** a group row slides the sidebar sideways (the main view and the group's view sit side by side; 320ms, `cubic-bezier(0.2,0.8,0.2,1)`, the hidden view fades and is inert; reduced motion snaps). The group's view opens with an "All sections" back link (label caps at 0.8rem, faint going paper, its arrow nudging left), the group's name in Anton at 1.6rem uppercase over the 2px paper rule, then its pages as entries: an icon, the name in label type (paper, yellow on hover), and a one-line note in `faint-foreground` at 0.78rem, truncated. The current entry is solid masthead red with white type. The sidebar stays in the group while the member moves between its pages, returns to the main view when they land elsewhere, and a page load always starts on the main view. Esc or the back link returns; focus moves to the back link on the way in and to the group's row on the way out. Phones keep the off-canvas sheet holding the expanded sidebar, drill-in included.
- **Sidebar icon rail:** the collapse control sits beside the wordmark and the logo expands the sidebar again; the choice is remembered (the `sidebar_state` cookie, read on the server so a page load draws it as left). The rail is 3.5rem wide and nothing moves when it collapses or expands: the 40px logo, the 18px row icons (centered on the rail, 28px from its edge), the 40px rows, the 38px headings and the footer (Settings and the 48px account row with its avatar) keep their positions, and the rows simply clip their labels and badges. The Pinned and Browse headings keep their height as a 1px `sidebar-border` rule 12px above their foot. Pinned Pages show as icons with the page's name (and Preview mark) in a tooltip; the group rows keep the red marker and Play's yellow dot. A group's icon slides its view out in a 19.5rem panel beside the rail (Ink 2, a rule on its right edge, a soft black shadow cast to the right, 260ms with the site's ease from 14px to the left; reduced motion snaps) over a scrim of the ground at 60%, without the back link: the group's name on the 2px paper rule and its entries, badges included. Focus moves to its first entry. Picking a page, Esc (which hands focus back to the group's icon), the group's icon again, or a click or focus outside closes it. No pin controls on the rail.
- **Running head (top bar):** the current route as a trail (e.g. GAMES / <TITLE> / REVIEWS), in label type at 0.95rem with 0.08em tracking. Parent crumbs are `faint-foreground` links that go paper on hover, separators are red slashes, and the current page is paper. Middle crumbs truncate first, at 14rem. On phones, only the page and its parent show. The trail is resolved on the server through the `@crumbs` parallel slot and replaces every in-page breadcrumb. The trail takes the bar's full width; there is no search in the bar (game search lives on /games).

#### Cover Story (signature)
Full-bleed key art under an ink scrim, with the monumental round numeral in the track's ink, "Round N / Month Year" beside it, then the two-line headline, fact chips, a three-line blurb, the club's stats (Anton numerals over label-type captions, the first in the track's accent: playing, cleared, reviews), the track button and outbound links. Art scales to 1.03 on hover over 700ms (`cubic-bezier(0.2,0.8,0.2,1)`).

#### Winner Starburst (signature)
A 26-point SVG burst set at a tilt (default -9deg, never square), lettered in Anton. The GOTM burst is yellow with ink type ("Game / of the / Month"). The NR burst is violet with white type ("Non-RPG / Game of / the Month"). At badge scale on grids it reads "GOTM". It appears only on GOTM and NR-GOTM winners. It stamps in once per page (480ms, `cubic-bezier(0.16,1,0.3,1)`, from 1.5x scale and 14deg off-tilt), and repeated bursts in a grid are `still`. Reduced motion skips the stamp.

#### Round Panel / Voting Strip
The club's open business in yellow: the "Round N / Nominations | Voting | Results" headline in Anton, a monumental days-left count, one line of status, and ink-on-yellow actions. When tall, it lists the latest five nominations, each with a 2px-cornered GOTM or NR tag. The /voting strip uses the same yellow, with a clock column and one slot per track for the member's own nomination or votes.

#### Notice Slip
The one way the site says "that didn't work". A paper slip with ink type at 2px corners, pinned at -2deg with the object lift: one Anton line, one plain sentence in ink at 75% (bold words in full ink), and optionally an Inverse action ("Try again") and a dismiss cross in its top corner that drops the notice from the address. It is an alert when the page opens on a failure, a status otherwise. The caller places it; the slip owns its look.
- **Front page cover:** over the cover art at `xl` and up; below `xl` it sits between the masthead and the pitch, and the GOTM burst steps aside rather than be cut by it.
- **Flat hero:** above the two track plates.
- **/join panel:** on the panel's top edge with the reason, in flow, so it pushes the panel down rather than covering "Pull up a chair.".

#### Join Panel and Cover Slideshow (/join)
- **Join Panel:** a yellow panel with ink type and the object lift, pinned on the right over the slideshow from `lg` (under it on smaller screens) and never moving with it. The Anton "Pull up a chair.", one line of why, then two numbered steps on a 2px ink rule (monumental Anton numerals): Open the invite (Inverse) and Continue (Inverse outline).
- **Cover Slideshow:** six full-height slides that crossfade about every 7s under a row of labelled ticks; the running tick fills in masthead red as its "you are here". The pause control comes first in tab order and is drawn last; hovering or focusing the slideshow holds it. Under reduced motion it never advances and has no pause control. On phones the ticks drop their labels and the current label shows above with an "n / 6" neutral chip.
- **Slides:** the first two are this month's winners as cover stories with their starbursts, or flat track plates (a rounded.md plate in the track's ink with its name in Anton and one line), the same plates as the front page's flat hero. The other four set a feature in Anton on ink over a fan of real recent winners' covers seated on the slide's foot at their hand-placed tilts. No counts, no member data, and /join never uses "issue" or "edition" words.

#### Game Cover (image fallback)
Box art at 3:4 with rounded.sm and a 1px paper/12 inset outline. When a game has no art, the cover is an `muted` block with the title set in Anton caps in `faint-foreground`, centred. It is never an empty grey rectangle or a stand-in image. Cover stories without art fall back to their ink scrim on black and keep their full typographic layout. The landing marquee renders only with real winners' art and shows nothing rather than stand-ins.

#### Shelves and Spines (profile)
Lists not being read are a bookcase. Each shelf has a monumental count and an Anton title on the left, and closed spines with titles set sideways on the right. Favorites ranked 1-3 stand on a podium (first in the middle and highest); rank 4 and lower sit level on the shelf. Now Playing sits above the case as open books, face-on.

#### Achievement Icon (die-cut, signature)
An Achievement's icon as a die-cut tile resting in its slot, at four sizes (40, 56, 80 and 128px; the edge is 3px, 5px at the largest). It is decorative: its name is always set beside it.
- **Unlocked:** the art on `muted` inside a die-cut edge in its Rarity ink (`faint-foreground` when the Provider gives no Rarity), at its stable tilt, with the die-cut rest shadow. The Unlock behind a Platinum, Mastery or Completion takes a foil edge instead. A PSN trophy carries a corner dot in its tier's metal (foil for Platinum), and a RetroAchievements hardcore Unlock carries a small paper "HC" tag. Without art the tile fills with the game tint and shows the slot number in Anton in the tint's contrast colour.
- **Locked:** the empty slot, a 1.5px dashed `border-strong` outline with the two-digit slot number in Anton in the game tint at 60%.
- **Hidden:** a sealed `muted` tile with a `border-strong` stroke, crossed by a diagonal band in the game tint, with an Anton "?" and, at large sizes, a "Hidden" label. Its name stays blurred until the viewer reveals it.

#### Foil Stamp
A Completion, Mastery or Platinum lettered in Anton ink on foil, pressed at -8deg with an inset ink outline and the stamp shadow, at three sizes. It sits on the corner of a set's title band, at the end of a binder index row, and over a Highlight.

#### Rarity Chip and Provider Chip
Both are solid chips at the chip scale with ink type (20px tall at the small size). The Rarity chip reads "Ultra rare · 2.1%", adding a hardcore figure where RetroAchievements has one. Below the chip, Rarity is printed in label type as "2.1% of players". The Provider chip reads the Provider ("RA", "Steam", "PSN" in tight rows). As a Linked Account chip it carries the member's name on that Provider in Barlow.

#### Game Tint: Spine, Band and Tabs
- **Spine:** a 10-14px tint strip down the left edge of a set's page or a hub card.
- **Band:** a solid tint block behind a game's title, in Anton set in the tint's contrast colour. It is the set page's masthead at 2.5-4rem, sitting on the 2px paper rule, and a 1.45rem link on hub cards.
- **Tabs:** the set page's view tabs (Checklist, Rarity, Timeline) sit on the spread's edge. The current tab is a taller tint tab, and the others are `card` tabs in `faint-foreground` that go `muted` on hover. The binder's index rows each carry a tint tab past the binder edge, numbered from `xl`.

#### Binder
- **Totals:** the left page's monumental Unlocks numeral and a four-column row of secondary counts.
- **Index row:** the two-digit row number in the tint, the set's title in Anton (it turns yellow on hover), a short Provider chip, then earned / total and a foil stamp once complete, or the percentage. A strip of 7px slot dots runs beneath: earned dots in the tint first, the rest dashed `faint-foreground`.
- **Filter tabs:** status tabs are `muted`, and the current one is `card` with a 2px paper top edge, carrying its count. Provider tabs are solid in their colour. Once one is picked, the others drop in height.
- **Rings:** 4 to 12 metal rings down the gutter from `xl`.

#### Hub
- **Day tape:** the day's label in extra-bold label type on torn paper tape, slightly tilted, with a hairline running out to a `faint-foreground` tally.
- **Latest card:** one member's Unlocks in one set on one day, on a tint spine, with up to five icons fanned like a hand of cards. A card holding a Highlight doubles: its lead Unlock sits large under a foil stamp or an ultra-rare odds tag, and the rest shrink to a strip of Rarity-ink dots.
- **Highlight tile:** the Unlock large and tilted, the stamp or odds tag pressed over it, the member's avatar on its corner, and a paper tag beneath edged in the tint (left) and the Provider colour (top).
- **Controls:** a view switch and Provider chips as plain links. The current option carries the yellow inset ring.

#### Club Set Page (game page)
One composite page per Provider behind Provider tabs. A tab carries a 3px top rule in its Provider colour and fills solid when active, so it joins the page's Provider-coloured top rule. The page has a tint spine. Each Achievement is faded by how few members hold it and ringed by a dot per member (filled in that member's ring colour when they hold it), opening on hover, focus or tap to the members who unlocked it. The members who completed the set sign the margin on foil, oldest first. The viewer's own earned / total links to their set page.

#### News card
One News Item as a frame on the contact sheet: an `card` card at rounded.md.
- **Art:** a 16:9 box with a 4px foot bar in the News Category's ink (dashed for Rumours) and the category tag in its top-left corner: a 22px chip in chip type, ink on the ink, reading the category's short name (the part before " & ", so "Announcements"), with a dashed inner ink outline for Rumours. The art scales to 1.03 on hover over 700ms, behind `motion-safe`.
- **Body:** the headline in Barlow 600 (about 1.02rem) links straight to the outside page in a new tab, with a small `faint-foreground` up-right arrow; it goes yellow on hover. The site's description follows in two lines of `dim-foreground`, then the member's comment in italic `dim-foreground` inside quotes.
- **Meta line:** label type at 0.76rem in `faint-foreground`, the site on the left, and the poster and UTC clock on the right. The poster links to their profile when they are a member.
- **No art:** the box is `muted` with the headline in Anton `faint-foreground`, centred and set clear of the tag, keeping its foot bar and tag (as with the Game Cover fallback). An outside image that fails to load is dropped to this fallback, so a broken image never leaves a hole. A frame the API marks unavailable reads "Image loading" in the same box.
- **Image-only News Item:** the member's comment takes the headline slot (with no comment there is no headline), and its images are a contact sheet of up to four frames with 2px gaps: two side by side, three as one tall frame beside two, four as a 2x2 grid, with an Anton "+N" on the last frame when there are more. Each frame opens its image full size in a new tab.
- **Images:** outside images load straight from their own address with no referrer, never through the image optimiser.

#### News category rail
The key to the cards' inks, and the News page's filter. On top, the "Search news titles" field (the input style, `border-strong` stroke going `faint-foreground` on focus, a clear X while a search is on; Enter searches). Under it a label-type section label, "News Categories", in `faint-foreground` over 38px rows on rule hairlines. Each row is a toggle button (`aria-pressed`): a 16px ink square (dashed for Rumours), the category's name in label type at 0.9rem, and on the right its count for the current search in `faint-foreground`, or "hidden by you" for a category the member switched off in settings until it is chosen. A square is filled while its category is in the view (chosen, or, with nothing chosen, not switched off) and outlined in its ink otherwise, with the name dropping to `faint-foreground`. The name turns yellow on hover, and the row takes the yellow focus ring. While a category is chosen, a "Show all categories" link (label type, `dim-foreground`, 2px red underline) sits at the foot and returns to the default view, keeping the search. Choosing, searching and clearing go through the page address without scrolling, and the rail dims while the page loads. When a filter or search finds nothing, the empty state names what was asked ("Nothing in Industry matches "zelda".") and offers "Clear filters".

#### Challenges (Challenges surfaces only)
- **Flyer:** a Challenge on the index's dotted pinboard (1px `foreground` dots at 6% on a 22px grid): a rounded.md card filled with its tint and set in paper type, at a stable tilt within ±1.4deg from its id (halved on phones) with the object lift, straightening on hover or focus (200ms, `motion-safe`). Top to bottom: an ink label (the Format's square, its name, "Always Open" or the Season), the name in Anton at 2.5rem (two lines), the Format's picture (a fan of three Pool covers, a row of up to twenty year slots filled for the viewer's Cleared years, or Secret Santa's paper name tag), three lines of description, a foot rule with the Host's mark and the Run count, and the viewer's own Run as an ink chip ("Your Run · 35 of 39 Cleared"). The whole card is the link (its title stretches over it). A Closed flyer mixes its tint 35% into `muted`, desaturates its covers and carries a paper tape with its opening date; a hidden one is taped "Hidden" for staff and its Host.
- **Billboard:** up to two Open Challenges with a clock running (a Seasonal one inside its Season, an Assignment Edition in sign-up or picking), nearest deadline first, side by side above the board. A straight flyer at double width with a heavier lift (`0 18px 40px rgb(0 0 0 / 0.55)`): the name at 3.6rem and the description on the left, the days-left numeral at 7rem with its caption and a larger Format picture on the right, and a full-width foot with the Host, Runs, Finished and the viewer's Run, whose Pool bar is in the tint's hi. On phones the numeral moves under the label.
- **Challenge banner:** full bleed, 330px (260px on phones). The key art (the Challenge's, else a Pool game's) over the tint fill under the left-hand ink scrim; without art the Format's picture sits in the tint. The tint chip ("Season 2026 · 22 Sep – 20 Dec", "Always Open", "Closed · opens 22 Sep 2027") and a neutral chip with the Format square, the two-line Anton headline with its second line in the tint's hi, and the numbers on an ink plate at 80%: days left in the hi, then Runs and Finished in paper.
- **View switch:** the section heading that switches the Challenge page's views: two Anton words at 1.875rem with their counts on the 2px paper rule, the current one paper over a 4px underline in the tint's hi, the other `faint-foreground`. The view is in the address.
- **Run card:** a `card` panel per member's Run: their mark and name in Anton, a "You" highlight chip and the 2px yellow inset ring on the viewer's own card, the score at 3rem with the target in `faint-foreground`, Cleared covers then In Progress covers on a dashed paper outline, a bar with a segment per game to Clear (at most twenty) filled in the tint's hi, and when it started or ended. A Finished Run is stamped "Finished" in the tint's hi at -5deg; an Abandoned or Expired one fades to 75% and lists last.
- **Run actions:** the viewer's Run action sits at the right of the view switch's rule: Start a Run (or Start a new Run) in yellow, the signal-orange outline Abandon your Run while it is Active, or Start a Run disabled beside why ("Opens 22 Sep"). The viewer's own ended Run card carries a small signal-orange outline trash button to delete it. Abandon and Delete ask first in the confirm dialog (signal orange solid). A refusal shows the API's own words in a notice slip under the switch rule; on a flyer or billboard, Start a Run sits above the card's stretched link and a refusal pins a small paper slip under it. Member marks show the member's picture when there is one, their initials on dim paper until it loads or when it can't (the Avatar's member-mark variant).
- **Run stamps (profile):** a member's Runs as a sheet of stamps under the "Runs" heading. A stamp is a perforated edge (10px, `background` holes on a 16px repeat) around its panel at a stable tilt within ±1.3deg from the Run's id (halved on phones), with the object lift; the whole stamp links to the Challenge. Current Runs are large landscape stamps, three across, nearest deadline first, on a `border-strong` edge: a `card` panel inset 2px in the tint's hi, the Format square and name, the name in the hi at 2.125rem, the score at 4rem, a bar in the hi (not for Slots, which may carry a "Caught Up" mark in the hi), the when-line in `dim-foreground`, and the In Progress (dashed) or Assigned cover at 78px. A Secret Santa sign-up waiting for its draw stands among them reading "Signed up". Past Runs are small portrait (4:5) stamps on a paper edge beside a monumental count, newest outcome first: Finished in the solid tint with paper type, Expired in the tint mixed 30% into `muted` with `dim-foreground`, Abandoned plain `muted` with `faint-foreground`, each postmarked in Anton at -12deg (ink on paper at 88% for Finished, outlines otherwise). On the member's own profile an Abandoned stamp carries the trash button on its top edge (shown on hover or focus, always on touch). More than three current Runs fold behind a stamp-sized "+N more" tile (the Button's stamp-more variant); more than ten past ones behind "Show all N".
- **Pool wall:** the Pool's covers at 3:4 (ten across at the widest, three on phones) under a segmented filter (All / Played by the club / Not played yet) and a key. Under each cover, the marks of members who Cleared it (solid) or have it In Progress (a paper ring); the viewer's games carry the yellow ring, unplayed ones sit at 50%, a game added by hand carries a paper "Added" tag. Forty to a page until "Show all"; the games left out are named under it.
- **Rule sentence (form):** the rules as one sentence in Barlow 500 at 2.375rem (1.5rem on phones) in `dim-foreground` on a `card` panel, each setting a word in paper 600 over a 3px `border-strong` underline with a muted chevron or calendar (the Button's rule-word variant). The open word takes a yellow underline on a 10% yellow wash and its control opens beneath the panel with a muted help line beside it; an invalid word is underlined in signal orange; once the rules are locked the words are plain `dim-foreground` with a lock, under a dashed notice. A source word carries a small x, and a dashed "+ franchise or collection" adds one.
- **Format cards and Pool tiles (form):** the Format as three choice cards (Anton name beside its ink square, one line under it, the yellow inset ring when chosen). The Pool wall's covers are buttons: tapping leaves a game out (28% and greyscale, a paper "Left out" tag, the x turns to +) or puts it back; a game added by hand has a paper outline and an "Added" tag; the last tile is the dashed "+ Add a game by hand".
- **Slots Run matrix (Challenge page):** a Slots Challenge's page swaps the view switch and Run cards for a `card` panel and a timeline. The panel's head is the label "Your Run · from 1988" over the score at 4.5rem (the target in `faint-foreground`), the summary in the label voice ("Cleared · 1 In Progress · 4 open years"), and at the right the yellow Pick a past Game Completion (with Counts past play) and the outline Move a game; a Caught Up or Finished Run is stamped in the tint's hi at -6deg. Under it a decade label column (Anton, `faint-foreground`) and ten columns ·0 to ·9: a Cleared year is its 3:4 cover with the year in Anton at the top left and a paper "Past" or "Moved" tag at the top right; an open year is a dashed `border-strong` tile with the year in Anton in the tint's hi and a small prompt ("Pick a past game", "Opened 1 Jan", or the In Progress game that fits it, whose tile's dash turns the tint's hi); years still to come are dashed `border` ghosts. Tiles are the Button's pool-tile frames. Under 480px a Cleared year drops its cover to its two digits on the tint fill. A tapped lane (`?run=<member>`) swaps in that member's Run, read-only, with their 56px mark, name in Anton and Back to your Run; an ended Run of yours fades its matrix to 75% and carries Delete. A refusal or a new Run's notice shows in a notice slip at the panel's top.
- **Runs timeline (Slots):** "Other Runs" on the 2px paper rule, a year axis labelled every 5 years, and a lane per member: mark, name and "from 1994", a cell per year (paper Cleared, a `border-strong` outline open, the tint's hi stripes where an In Progress game fits, nothing before their first year, whose cell takes a 2px ring in the tint's hi), the score in Anton with "Caught Up" in the tint's hi, and an arrow. Hover lifts to `muted`, the selected lane sits on `card` with the yellow inset ring and a yellow arrow. Eight lanes, then "Show all". On phones the name column drops to the mark.
- **Year ruler (form):** a Slots Challenge's range under its sentence, on a `card` panel: a tick every 2 years (labelled every 10) from 1970 to now, the range a paper band at 12% inside a paper hairline, and two handles (paper bars with a `card` halo, yellow while dragged or focused; the Slider's year-ruler tone), each labelled with its sentence word in the label voice, yellow while that word is open.
- **Edition page (Secret Santa):** an Assignment Challenge's page follows its Edition through sign-up, picking, the reveal and the end. The banner's chip names the Edition ("Edition 2026") beside a "Hosted by the club" chip, its picture is twelve small advent doors (the last one open), and its numerals follow the phase (days to sign up and signed up; days to pick and drawn or picked; Finished and In Progress; Finished and Expired). Under the rules (told from the Edition's calendar, with an outline Edition switcher at the right) runs the December strip: a tile per day from the draw to the reveal in Anton on `card`, the three key days in holly with ink type and holly captions, the days gone at holly 18% and today in a paper ring while the Edition runs; on phones it scrolls sideways to today or the next key day. Then the advent doors (3:4, up to six across by the column's width, three on phones) beside a 300px `card` side panel (above them on phones). A shut door is dark holly (the tint mixed 55% into `background`) with a 2px tinsel edge, its number in Anton tinsel and the member's name in label type; while picking it carries a tinsel check seal once its Santa picked, or dims (tint 35%, tinsel 35%) while "Waiting" (only staff and the time after the deadline can tell). After the reveal each door opens on the game's cover with the name and the game under a short foot scrim, then "Random pick" where it was one and, once the Edition ends, "From Lore Keeper" (a random pick names its Santa on a second line), and a paper "Finished", outlined "In Progress" or muted "Expired" tag. The viewer's seat while they can join is the yellow door "Your door: sign up" with a soft yellow halo. The side panel holds the next date in label type, a 72px holly numeral, the viewer's own business in a yellow panel (Sign up / Leave, "You are a Santa · Pick for…" with the way to the pick page and a quiet "Leave this Edition" that asks first, "Your game · See your Run" after the reveal), a dashed panel when their backlog is under 5, a notice slip for a refusal or for being left out, and muted context lines. When the Edition ends, the Santa circle sits in the panel: every member's mark round a 260px ring in draw order (the viewer's with the yellow ring), an arrow inside from each Santa to the member they picked for (holly where that Run Finished, mute paper otherwise, dashed for a random pick) drawing in once over 600ms (`motion-safe`), the count of Santas at the centre, a key, "Your Santa was …" and the way to the next Edition.
- **Santa pick page (private):** a drawn Santa's page for their recipient while picks are open. The header carries the holly Edition chip and a "Private" chip with a lock, "Pick for Loot Hoarder" at page scale on the 2px paper rule, and at the right the days left to pick as a 72px holly numeral over "days · picks due Tue 15 Dec"; under the rule an eye-off icon with the privacy line, then "To help you choose" in label type with the recipient's top platform and genres in `dim-foreground`. The deal card (460px from a 56rem column) shows one game of the eligible backlog over its key art (the tint without art) under the scrim from the left: the position in label type ("04 / 14 · from Loot Hoarder's backlog"), the two-line headline in Anton (96px for a short line, stepping down with its longest line so it stays on two; a last word of two letters or fewer keeps the word before it, "Dragon Quest / XI S"), neutral year and platform chips, HowLongToBeat's time as an Anton line ("About 62 hours") over "To beat · HowLongToBeat", and the actions: yellow Pick this one (Pick this one instead once another game is picked), outline Next game, ghost Shuffle; on the picked game the Done button "Picked" and Keep looking. At the right the 220px cover leans at 3deg and the name tag hangs off it on a tinsel string: a 250px paper luggage tag at 4deg (clipped top corners, an ink eyelet ringed in tinsel, the object lift as a drop shadow), "To" in label type in `slip-muted-foreground`, the recipient in Anton, a dashed slot reading "Your pick goes here" in italic until a pick fills it with the small cover and title, and a holly gift icon with "From: your secret Santa"; a pick presses a holly "Picked" stamp onto the tag at -10deg (the burst stamp at 400ms, `motion-safe`, again when the pick moves). Under a 2px tinsel rule at 60% runs the reel, a listbox of every eligible game as a 64px cover (unseen at 55%, seen at 85%, the one showing at 74px in the yellow ring, a holly dot over the picked one) that scrolls sideways to the current one; then one `faint-foreground` note. While focus is inside the deal, ← → step, S shuffles and Enter on the reel picks; a sideways swipe across the card steps. Narrower than 56rem the card stacks: the cover, the tag below it, then the words with the actions full width. A refused pick shows the API's reason on a notice slip above the card; picks closed, nothing left to pick, or anyone who isn't the Edition's Santa get a notice slip with the way back to the Challenge.
- **Assignment calendar (form):** the Assignment sentence "Members sign up until [1 Dec], pick by [15 Dec] and see their game on [25 Dec]. They have until the next 25 Dec to Clear it.", each date a calendar word opening a day and month beneath it; "the next 25 Dec" is plain sentence text, not a word (the year to Clear always runs to the next reveal). Under it, on a `card` panel, the December preview (the month's 31 tiles, or the draw to the reveal for a calendar outside December) with the key days in holly, and the fixed backlog rule in `faint-foreground`; on phones the preview wraps into rows so every key day shows (the Edition page's strip scrolls instead).

#### Club Lore (Club Codex surfaces only)
- **The shelf (/codex/lore):** a page of Lore Entries as spines on a `card` panel, newest on the left, standing on a 16px `border-strong` board with the object lift. A spine is 74px wide for the shortest story up to 112px at 4000 characters, 440 to 520px tall from its id, in one of three bindings from its id (jade with ink type; `muted` with paper type under a 6px jade cap; paper with ink type): the title sideways in Anton reading bottom to top, a rule, the date at its precision in label type ("12 Aug 2020", "March 2019", "2021", "Undated") and the author's initials. The viewer's own carry a yellow "Yours" tag at -4deg; the picked spine lifts 22px with the yellow inset ring. The shelf is a listbox (click or arrow keys; the pick is kept as `?entry=`), and the picked Lore Entry slides out beside it in a 440px `card` with a 6px jade tab: date, the title in Anton at 2.5rem, the story's opening, up to three square images, the author and "See also N", and Read it. On phones the spines scale to 70% and scroll sideways inside the panel; the slide-out drops under it.
- **The Lore Entry spread (/codex/lore/<id>):** the title in Anton at 6rem (3rem on phones) with its second line, at least a third of the title, in Club Lore jade; the date pressed on as a jade stamp in a 2px inset outline at -6deg ("The night of", "That month", "That year"); "Told by" with the author on the byline. The story runs in a 600px column between two 250px margins: the opening paragraph at 1.375rem under a jade Anton drop cap, headings in Anton over a 44 by 3px jade bar, a quote as the pull quote between jade rules (its last paragraph the cite in label type), and a jade square after the last word. Mentions read as the members' current names, underlined in jade.
- **Taped photo:** a Lore Entry's image placed in its story hangs in a margin beside the block before it (alternating right, left, and never on the pull quote's side), on a paper mount with the object lift, tilted 2.5, -3, 3.5 or -2deg by its place in the gallery, under a strip of parchment tape (`codex-history` at 72%) counter-rotated at twice the tilt. Its caption is Barlow italic in ink, a leading time or a short lead before a colon set as a `codex-lore-print` label. It opens full size in a dialog. On phones photos stack under their paragraph at half the tilt.
- **The writing desk (/codex/lore/new and edit):** a manuscript sheet (`card`, 4px corners, a deep lift) with the shared editor's toolbar sticky across its top on `muted` (Mention a member last) and the plain-text count in Anton at its right ("812 of 4000", signal orange past the limit), the title written in place in Anton (the Textarea's headline variant), the author's byline, then the story; mentions are chips on paper at 10% and a placed photo is a small taped thumbnail with its caption field. Beside it a drawer of `muted` cards at slight tilts: Date (the date set big in Anton, a 4px strike and 45% grey over the parts the precision drops, over No date | Year | Month | Day) and Images (numbered pinned photos at 4:3, "After paragraph 3" or "Not in the story" in signal orange, Place at the caret, the dashed Add an image slot). Uploading photos wear an ink overlay with a running bar; a failed one keeps its slot outlined in signal orange with Retry and Remove. On phones the drawer drops under the sheet, flat, and Cancel and Save stick to the foot of the screen.

#### Club History (Club Codex surfaces only)
- **The timeline (/codex/history):** public, so it serves two frames: a Visitor gets the public top bar (the wordmark, Home and History with the current one underlined in masthead red, the outline Sign in with Discord and the yellow Join the Discord), a Member the app shell. Under the page header ("Club History", the count, the yellow Add a History Event for Admins and above) and a 70ch intro in `dim-foreground`, the tools row: a filter icon and the Kind chips (the Button's kind-chip variant: 26px label type outlined 1.5px in the Kind ink with ink-coloured type, the current one filled with ink type; "All" takes paper as its ink), and at the right the Oldest first | Newest first switcher; both live in the URL. Then a chapter per year on a 2px paper rule: the year in Anton at 7.5rem over its count in label type, the History Events beside it, and, when any has images, a 250px column of photos pinned up. A History Event is a line of its 10px Kind dot, the date without its year ("14 March", "June") in label type, or "Some time in 2016" in Barlow italic `dim-foreground` for a year-only date, and the Kind in its ink; then the title in Anton at 2.125rem, max 30ch, and the description in `dim-foreground` with mentions as the members' current names (linked for Members, plain for Visitors). Admins get a quiet Edit (quiet-link) and Delete (the Button's quiet-delete variant, signal orange label type) at the right of the date line, on hover or focus (always on touch screens). A year with nothing recorded between two chapters is one line on a hairline: the year in Anton at 2.5rem in `border-strong` and "Nothing recorded". On phones a chapter is one column, the year at 4.5rem with its count beside it, the photos a sideways row of mounts at 60% width and half the tilt; the Kind chips scroll on their own row over the switcher.
- **Pinned mount:** a History Event's image on a paper mount (8px, 10px at the foot, 2px corners) with the object lift (0 12px 30px), tilted -2.2 then 1.6deg alternating, under a 12px paper pin at the top centre ringed in `muted`.
- **The front-page band:** under the hero, while the Club Codex is Live (and not hidden by the Member's Feature Preference) and once there is a History Event: a 2px paper rule, then the year of the earliest History Event in Anton at 10.5rem in Founding rose, beside two fixed sentences at 1.25rem (42ch) and the outline Read the Club History. On phones the numeral sits above at 6.5rem and the button runs full width.
- **The History Event desk (/codex/history/new and edit):** the writing desk with its cards swapped: the sheet holds the title and an optional description (mentions as on the Lore desk, no photos placed, no byline); the drawer holds Kind (five 64px tiles, the Label's kind-tile variant around a hidden radio: outlined 1.5px in the Kind ink with its name in 10px label type in that ink, the checked one filled with ink type, lifted 4px, tilted -2deg with a 0 6px 14px lift), Date (Required, Year | Month | Day) and Images as a plain gallery (the pinned numbered photos without a place in the text).

#### Release Calendar
The /releases page (www#114) is a wall calendar over an agenda. Under the page header ("From today · N Upcoming Releases" at its right) a toolbar sets the grid's month in Anton between outline ‹ › buttons, then Today (the Selected paper block while the grid is on today's month, outline otherwise, since pressing it is how you get back), and at the right the month's count and the "Platforms:" select field. The month's vague Upcoming Releases sit in a `card` band above the grid, led by the dashed Date Precision chip and the period in label type ("Day TBA / November 2026"; a quarter or year in its last month). From `lg` the grid is seven rule-lined columns, Monday first, label-type weekdays on a `card` row; each day is a 132px cell with its Anton number and its entries (a 28px cover, a two-line title, small region chips with the platforms as one line of label type). Past days go `faint-foreground` with covers at 55% and region chips as outlines; today is outlined 2px in masthead red with its number underlined ("you are here"); the days either side of the month stay blank. Below `lg` the grid becomes 50px `card` tiles with a dot per entry (three at most) linking down to that day, over the month's days as a list. Under the grid runs every other Upcoming Release from today on, as agenda sections (`SectionHeading`, "5 Upcoming Releases · July to September"): a 104px date column (an Anton day over its weekday, or "Dec", "Q3", "2027", "TBA" over the dashed chip) beside 54px covers, titles, region chips followed by neutral platform chips, and "First released Sep 2025" in `faint-foreground` when the API names one. In today's month a red label-type "Today · Tue 17 Nov" rule runs out to the edge before the first day from today. The list never moves with the grid, so a past month shows only up top. A month with nothing, or a filter that leaves nothing, says so on a dashed `border-strong` slip laid over the grid (in the flow on phones), with "Show all platforms" and the months either side.

#### Birthdays
A shared Birthday is the day and month only, never the year or age. Lucide Cake marks it everywhere, never an emoji.
- **Upcoming Birthdays line (dashboard):** one contents line under Previous rounds (under the "Nothing on the cover" note when Voting & GOTM is hidden), between a 2px `foreground` rule and a 1px `border` hairline. A label-type "Birthdays" head with the cake (screen readers hear "Upcoming Birthdays"), then each member in date order, split by `border-strong` slashes: the day in `faint-foreground` label type ("Tomorrow", "Sat 21 Nov") before the name, underlined in `border-strong`. Today's member sits behind a paper "Today" chip with the name in Anton. It wraps rather than truncates; on a phone the head stacks above the list. No line at all when nobody's Birthday falls in the next 30 days.
- **Byline Birthday (profile banner):** the cake and "21 Nov" as the byline's last part, after a middot, never wrapping inside itself; on the day it reads "Birthday today" in `foreground`.
- **Birthday day tape (profile banner):** on the day, a paper day tape ("Birthday today · 18 Nov", label type on `foreground` at 95%) pinned across the banner's top-left corner at -1.2deg, running off the left edge with a torn right end and a drop shadow. On a phone it drops below the owner's Edit and Imports.
- **Share rows (/settings and the staff desk):** the settings switch row. Members get "Share my Birthday", dimmed and inert until the Birth Date has a day and month. On the staff desk the row reads "Shares their Birthday" and works one way: flipping it off opens a one-line confirm under the row (the question in `foreground`, a destructive-ghost "Stop sharing" and an outline "Keep it", which takes the focus), since only the member can turn it back on.

#### Production desk (staff surfaces)
The /admin area is a production desk: the club's staff put the next issue together. It is a staff surface only; members never see it. Every desk page opens with the desk header and keeps the Two-Line Headline and paper-rule habits of the rest of the site.
- **Desk header:** the page name big in Anton on the 2px paper rule, with a short label-voice note on the right (who is at the desk, a count, the viewer's time zone) that wraps under the title on a phone.
- **Contents page:** the /admin landing. The viewer's tools grouped by area, each a link, a dot leader and a live note where a magazine prints the page number ("Round 143 open", or "Failed 1 h ago" in signal orange). Each role sees only its own groups.
- **The wire:** bot jobs newest first, each a slip with its clock and day, what it did, who asked (Admins and up) and a stamp. A failed slip quotes the bot's error under a dashed rule in signal orange; a done one quotes what the bot reported. No retry buttons: a failed job stays failed.
- **Stamps:** Queued in highlighter yellow, Done in done green, Failed in signal orange, as a 2px (wire) or 3px (proof) inset outline in Anton, tilted 4 degrees. The proof's stamp presses in with the starburst's stamp motion when its phase changes, behind `motion-safe`.
- **Proof card:** a form's preview of what the bot will post (a poster, a message, a round), set beside the form. Once sent it is stamped Queued in its corner, the stamp follows the bot job to Done or Failed, and the job's status line sits under it.
- **Typed confirm:** a destructive action confirms by typing the words shown, in a dashed signal-orange box with its label cut into the border. The solid orange button stays off until the words match.
- **Dictionary list and Undo bar:** lists and editors file entries under big letters in two columns with an A to Z jump bar. Delete strikes the entry through and holds it behind an Undo bar, a signal-orange bar that drains over the hold; the request is sent only when the bar runs out.
- **Date ruler (voting console):** the round as a ruler of dates: nominations opening, the vote, any runoff, today in red, and the yellow Next vote pin. The pin drags in whole days and steps with the keyboard, and a plain date field beside it sets it too. Below md the ruler is left out (as in the chosen mock) and the console leads on the round numeral; the date field still sets the pin.
- **Feature Flags (/admin/features):** the desk header ("Features", with the Live / Preview / Off counts and a note that changes reach the site at once and the bot within a minute), then two departments, Core Features and Hideable Features, each a section heading with no subtitle over one table whose columns line up across both: the Feature's name in Anton, what it covers (Website, Bot, Posts as neutral chips on a faint well, bot commands in their own case), the last change (state, who, when, and the reason quoted in italic) and an Off / Preview / Live segmented control. The selected segment and the state in the last change wear the state's ink: Live in done green, Preview in highlighter yellow, Off in masthead red, as type and a 2px inset stroke on ink, never as a fill. A Preview Feature's name carries a yellow "Staff only" outline tag, and an Off Feature's name drops to `faint-foreground`. Preview and Live save on click; Off opens a dashed signal-orange confirm under the row, its question cut into the border (no typed words, since Off is undone with one click). A speech-bubble button beside the control opens a yellow-edged reason field whose text goes with the next state picked. In the table the three segments are equal and fixed in width, so the control never shifts when a state is picked; stacked, they size to their labels so the name keeps its room. Below 85rem (1360px) each row stacks: name and control, then the coverage lines, then the last change.

**The Desk Green Rule.** Done green (`ok`) shares the hex of the uncommon Rarity ink because the two never meet: Rarity inks stay on achievement surfaces and done green stays on the staff desk, which shows no achievements. It is its own token so neither role borrows the other, and it is still a mark (type, a stamp outline, a dot), never a fill behind type.

**The Off Red Rule.** On the staff desk only, masthead red also marks a Feature Flag that is Off: its selected segment and its state in the last change, as type and a stroke on ink (ink, not `muted`, under it, so the red clears 4.5:1). Off is the loudest thing a flag can do, so it takes the loudest ink, and staff alone see it, so it can never read as GOTM to a member. The confirmed action that turns a Feature Off is still a signal-orange destructive button: red is the state, orange is the act. Members' surfaces never show a flag's state.

### Do's and Don'ts

#### Do:
- **Do** colour a thing red only if it is GOTM, "you are here" or (on the staff desk) an Off Feature Flag, violet only if it is NR-GOTM, and fill it yellow only if it is a call to action or the GOTM starburst.
- **Do** open every page with one monumental object (a numeral or a two-line Anton headline) and rule every heading with 2px paper.
- **Do** set every game headline with the Two-Line Headline Rule.
- **Do** give an absent track's space to what remains (the yellow panel or the promoted NR cover) on the dashboard.
- **Do** split one cover between co-winners and letter them A, B, C in the track's ink.
- **Do** fall back to the title in Anton on `muted` when art is missing.
- **Do** keep motion to the single starburst stamp, gentle art scale on hover (1.03-1.04, 500-700ms), the landing marquee and, in the Achievement Hub, an icon straightening from its tilt on hover (200ms), all behind `motion-safe`.
- **Do** keep the Achievement Hub's colour roles (game tint, Rarity inks, Provider colours, foil) on achievement surfaces, and set every tint with its contrast type.
- **Do** keep foil for Platinum, Mastery and Completion.
- **Do** keep the region inks on release surfaces, as region chips, and draw Date Precision as the dashed chip, never a hue.
- **Do** keep the News inks on news surfaces (the News page, its cards and filter, the category switches on /settings), as foot bars, tags and squares with ink type, and always draw Rumours dashed.
- **Do** use the glossary in achievement copy: Achievement, Achievement Set, Unlock, Highlight, Rarity, Completion, Mastery, Platinum, Provider, Linked Account.

#### Don't:
- **Don't** fade key art into coloured gradients, add glow accents, or use gradient text. Foil is the single sanctioned gradient, and it never sets text.
- **Don't** put a starburst on anything but a GOTM or NR-GOTM winner.
- **Don't** put a breadcrumb inside a page; the running head is the only trail.
- **Don't** add a small tracked-caps kicker or eyebrow above a headline. Track labels sit with a pick's art as data, not above titles as decoration.
- **Don't** use hard offset shadows; shadows here are soft, black and directional.
- **Don't** use emoji or text glyphs as icons; icons are line SVGs (Lucide) at 16-18px.
- **Don't** set Anton in mixed case or at body sizes, or set body copy in Barlow Condensed.
- **Don't** round corners past 4px except avatars, status dots and die-cut achievement icons (6px).
- **Don't** put violet or GOTM red on an achievement surface; a game tint that happens to be red or violet is content, not a track.
- **Don't** say sticker, album, pack or pull in the UI. The binder is a visual metaphor; the copy keeps the glossary terms.
- **Don't** call the GOTM history "Back issues".
- **Don't** use done green or the desk stamps outside the staff desk, or red for a destructive action.
- **Don't** fill a panel with a News ink, or use one on a surface that is not about news.
- **Don't** let a Challenge tint or a Format ink leave Challenges surfaces, fill anything with a Format ink, or set anything but paper type on a tint fill.
