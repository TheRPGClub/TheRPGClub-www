---
name: The RPG Club
description: Every GOTM round is an issue of the club's own 90s game magazine.
colors:
  ink: "#0b0b0d"
  ink-2: "#141417"
  ink-3: "#1d1d22"
  rule: "#2a2a31"
  rule-strong: "#3a3a43"
  paper: "#f4f4f0"
  paper-dim: "#b9b9b2"
  paper-mute: "#8d8d87"
  gotm: "#ff0000"
  gotm-soft: "#ff5a4f"
  nr: "#8a4dff"
  nr-soft: "#b896ff"
  highlight: "#ffd400"
  highlight-ink: "#3a3200"
  destructive: "oklch(0.74 0.17 52)"
  destructive-ink: "#2a1300"
  ok: "#5fd08a"
  rarity-common: "#f4f4f0"
  rarity-uncommon: "#5fd08a"
  rarity-rare: "#4aa8ff"
  rarity-ultra: "#ff4fa3"
  provider-retroachievements: "#2ec4b6"
  provider-steam: "#66c0f4"
  provider-psn: "#4677e6"
  tier-bronze: "#c8814a"
  tier-silver: "#c0c6cc"
  tier-gold: "#e0b84a"
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
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-nr:
    backgroundColor: "{colors.nr}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.paper}"
  button-on-highlight:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "36px"
  button-destructive-solid:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-ink}"
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
    textColor: "{colors.paper-dim}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-gotm:
    backgroundColor: "{colors.gotm}"
    textColor: "#ffffff"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    height: "24px"
  chip-nr:
    backgroundColor: "{colors.nr}"
    textColor: "#ffffff"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    height: "24px"
  chip-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    height: "24px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.paper-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.gotm}"
    textColor: "#ffffff"
  search-field:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "36px"
  round-panel:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 18px 16px"
  feature-card:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  game-cover-fallback:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.paper-mute}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
  achievement-icon:
    backgroundColor: "{colors.ink-3}"
    rounded: "{rounded.die-cut}"
    size: "56px"
  achievement-icon-locked:
    backgroundColor: "transparent"
    textColor: "{colors.paper-mute}"
    rounded: "{rounded.die-cut}"
    size: "56px"
  chip-rarity-ultra:
    backgroundColor: "{colors.rarity-ultra}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-provider-retroachievements:
    backgroundColor: "{colors.provider-retroachievements}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-provider-steam:
    backgroundColor: "{colors.provider-steam}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  chip-provider-psn:
    backgroundColor: "{colors.provider-psn}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  foil-stamp:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.xs}"
    padding: "8px 12px 6px"
  binder:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.lg}"
    padding: "10px"
  binder-page:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  view-tab:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper-mute}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
  day-tape:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "4px 16px 3px"
---

# Design System: The RPG Club

## Overview

**Creative North Star: "The Monthly Issue"**

Every Game of the Month round is an issue of the club's own 90s game magazine. The GOTM winner is the cover story, the Non-RPG pick is the feature, the club's open business (nominations, the vote) is a highlighter-yellow insert, and every other page is a department: GOTM history is the archive, a member's profile is their bookcase, a game page is its own cover story. The voice is loud and printed: ink-black stock, condensed caps set big, three spot inks that each mean one thing.

Density is magazine density, not dashboard density. A page leads with one monumental object (a round number, a game's two-line headline, a member's name in Anton at banner scale), then settles into ruled departments with labels in tracked condensed caps. Surfaces are hard rectangles with barely-there corners. Depth comes from key art under black legibility scrims, not from glowing cards.

The world refuses the default dark game-tracker: gradient-faded key-art cards, glow accents, gradient text. The app is dark-only (`<html class="dark">`, theme colour #0b0b0d).

**The Achievement Hub department.** Achievements are the magazine's collectors' department. A member's achievements are a binder opened on its gutter, each Achievement Set is a page or a two-page spread inside it, and the community hub is a wall of the club's Unlocks pinned up under paper-tape day labels. The department keeps the ink ground, Anton and Barlow, and the 2px paper rules, and it brings its own colour roles (game tint, Rarity inks, Provider colours, foil) that appear on achievement surfaces only. The binder refuses the tracker default of a stats header over a grid of progress cards. Icons are die-cut objects resting in slots, locked Achievements are dashed numbered slots, and hidden ones are sealed tiles.

**Key Characteristics:**
- Ink-black ground with three spot inks: masthead red for GOTM, violet for NR-GOTM, highlighter yellow for the member's own business.
- Anton in caps for every headline and numeral, Barlow Condensed tracked caps for every label, Barlow for reading.
- Monumental numerals: the round number, a shelf's count, the days-left clock.
- The winner starburst, stamped once, only on winners.
- Two-line game headlines, with the second line in the track's accent.
- Hard rectangles (2-4px corners) and 2px paper rules under headings.
- In the Achievement Hub: game-tint spines, bands and tabs; die-cut icons edged in their Rarity ink; foil stamps only for Platinum, Mastery and Completion.

## Colors

An ink-black stock printed with off-white paper type and three spot inks, each owned by one meaning.

### Primary
- **Masthead Red** (gotm): the GOTM track's ink. GOTM chips, the GOTM round numeral, GOTM winner tags (A/B/C), the primary "View game" button on a GOTM cover, the 3-4px foot bar under a GOTM pick's art, the running-head separators, the active sidebar item, and the "RPG" in the wordmark. It is sampled from the club logo (exactly #ff0000; the `brand-50..950` scale in globals.css is its tonal ramp).
- **Soft Red** (gotm-soft): GOTM track labels set as small type on ink, where full red would vibrate.

### Secondary
- **Feature Violet** (nr): the NR-GOTM track's ink. NR chips, the NR button, the 4px top rule of the NR feature card, NR foot bars, the NR starburst fill, and the NR round numeral on a promoted cover.
- **Soft Violet** (nr-soft): the NR headline's second line, NR labels and NR stat accents on ink.

### Tertiary
- **Highlighter Yellow** (highlight): the member's own business. As a fill: calls to action (the nominations/voting round panel, the voting ballot strip, the review compose panel, the imports panel, the landing's join band, the `highlight` button and chip, the sidebar's voting badge, "Your pick") and the GOTM starburst. As type or a line: the GOTM headline's second line, link and card-title hover, the focus ring, text selection, the input caret, and the border of an editor panel that is open for the member's own edits.
- **Yellow Ink** (highlight-ink): secondary text set on a yellow panel (bylines, small print).

### Neutral
- **Ink** (ink): the page ground and the base of every scrim.
- **Ink 2** (ink-2): raised panels, cards, the search field and the sidebar.
- **Ink 3** (ink-3): wells inside panels, cover placeholders, hover fills.
- **Rule** (rule): hairlines, top-bar and sidebar borders.
- **Strong Rule** (rule-strong): input strokes, dashed empty-state borders, the scrollbar thumb.
- **Paper** (paper): primary type, and the 2px rule under every page and section heading.
- **Dim Paper** (paper-dim): body copy, blurbs, inactive nav and secondary labels.
- **Mute Paper** (paper-mute): meta, counts, parent crumbs, placeholders and the cover-fallback title.
- **Signal Orange** (destructive): destructive actions only. It is chosen to sit off both red and yellow, so a destructive action never reads as a track or a call to action.
- **Orange Ink** (destructive-ink): type on a solid signal-orange fill (the confirmed destructive button). Paper type on orange misses AA; this near-black brown clears it.
- **Done Green** (ok): the Done stamp, dot and check on the staff production desk only. A mark, never a fill behind type, and never on member surfaces. See the Production desk section for why it shares the uncommon Rarity ink's hex.

### Named Rules
**The One Ink Per Track Rule.** Red means GOTM, violet means NR-GOTM, and nothing decorative borrows either. A GOTM element never wears violet and an NR element never wears red. A game that won both tracks reads as GOTM first.

**The Yellow Is Yours Rule.** Highlighter yellow is filled only for calls to action and the GOTM starburst. As type it marks the GOTM headline's second line and interaction states (hover, focus, selection, caret). It never fills a decorative panel.

**The Red Is Also Here Rule.** Besides GOTM, masthead red marks where you are: the active sidebar item and the running-head separators. It marks nothing else.

### Achievement roles (achievement surfaces only)
The Achievement Hub adds four roles to the palette. They live on achievement surfaces only (the member achievements page, set pages, the hub, the profile's Achievements section and the game page's achievements) and never leave them. (The staff desk's done green `ok` shares the uncommon ink's hex as a token of its own; see the Desk Green Rule.) On these surfaces, red appears only as "you are here" in the shell, violet never appears, and yellow stays with calls to action and interaction states.
- **Game tint** (sampled, not a token): each Achievement Set's colour, taken from the vivid dominant hue of its cover (or its set icon), clamped to a vivid-but-not-neon, mid-lightness range, and darkened until ink or paper type on it clears 4.5:1. A set without usable art gets a hashed tint from a curated list kept away from the GOTM red and the NR violet. It is a set's spine, its title band, its view and index tabs, its slot numbers and slot dots, its progress bar, and the seal across a hidden tile.
- **Rarity inks** (rarity-common, rarity-uncommon, rarity-rare, rarity-ultra): the 3px die-cut edge of an unlocked icon, the Rarity chip fills, and the Rarity tally bars, by the Provider's overall Rarity: common at 50% and above (paper), uncommon 15-50% (green), rare 5-15% (blue), ultra rare under 5% (hot pink). Ultra rare is the Highlight line, so hot pink also prints an ultra-rare Unlock's odds tag.
- **Provider colours** (provider-retroachievements, provider-steam, provider-psn): solid Provider chips and Linked Account chips, Provider filter tabs, and a 3px top rule on Provider pages and cards, always with ink type. A deselected Provider chip drops to a 1.5px inset outline in its colour. PlayStation is lifted from #3b6fe0 so ink type on it clears AA.
- **PSN tier metals** (tier-bronze, tier-silver, tier-gold): the small corner dot on a PSN trophy's icon. The Platinum dot is foil.
- **Foil** (sidecar `foil`): a holographic conic edge (#b9f3ff, #ffd6f5, #fff3b0, #c7ffd9) under a soft diagonal white sheen, always with ink type.
- **Member ring colours**: on a game's club page, each member holding an Achievement is a dot on the ring around its icon, in one of eight muted colours held under the Rarity inks and off all three track inks.

**The Game Art Is Content Rule.** A game tint is sampled from the game's own art, so, like key art, it is exempt from the One Ink Per Track Rule: a red or violet tint never means GOTM or NR-GOTM. The system's own tints (the hashed fallbacks) stay off red and violet so a game without art never reads as a track.

**The Tint Carries Its Type Rule.** A tint never travels without its contrast colour. Type on a tint is ink or paper, whichever clears AA, and a tint band is always solid, never a gradient.

**The Foil Is Earned Rule.** Foil is the system's single sanctioned gradient. It marks only Platinum, Mastery and Completion: the foil stamp, the foil die-cut edge on the Unlock behind one, the Platinum tier dot, the foil frame behind a Platinum on a game's club page, and a Completion signed in the margin. It never sets text, and it never decorates.

### Journal member inks (journal surfaces only)
The Game Journal gives each member a colour of their own, so their run reads at a glance on the game page's chronology plate (the line and dots) and on the /journals shelf (the cap of their spine). It is picked from the member's Discord id, so a member wears the same ink on every journal surface. The six inks are fern #6dd17f, lagoon #43d3cc, orchid #f077c0, sky #86d3f6, peony #fab6ba and cornflower #719def. They are marks, never fills behind type: each clears 6:1 against ink-2 and ink-3, so a dot or line holds well past the 3:1 non-text minimum.

**The Journal Ink Is a Person Rule.** A journal ink means one member and nothing else. The inks stay off masthead red, feature violet, highlighter yellow and signal orange, so a journal line never reads as a track, a call to action or a destructive action, and the yellow ring on a selected dot stays the only interaction mark. They do not borrow the Achievement roles (the member ring colours stay on achievement surfaces), and they never leave journal surfaces.

## Typography

**Display Font:** Anton (with Impact, sans-serif), loaded at weight 400 only
**Body Font:** Barlow (with system-ui), 400-700 with italic
**Label Font:** Barlow Condensed, 500-800

**Character:** Anton is a caps-only poster face that does the shouting: headlines, numerals and stats. Barlow Condensed in tracked caps is the magazine's furniture: nav, chips, buttons, meta. Barlow carries the reading. Numerals are tabular everywhere (`font-variant-numeric: tabular-nums` on body).

### Hierarchy
- **Numeral** (Anton 400, 5.75rem, line-height 0.8, -0.01em): the monumental round number on a cover, a ledger row or a previous-rounds strip; the counts that head profile shelves; the days-left clock. Set in the track's ink where a track owns it.
- **Display** (Anton 400 caps, 3.75rem phone to 5.75rem desktop, line-height 0.9): a single winner's cover headline (capped at 11ch) and the hero names on game and member banners.
- **Headline** (Anton 400 caps, 3rem to 3.75rem): page titles (`PageHeader`), sitting on a 2px paper rule with a count beside them.
- **Title** (Anton 400 caps, 1.875rem): section headings inside a page (`SectionHeading`), also on a 2px paper rule; feature-card and panel titles run 1.45-2rem.
- **Body** (Barlow 400, 1rem, about 1.5): blurbs and reviews, measure 48-68ch (65ch for page descriptions). Review headings lean on Barlow italic.
- **Label** (Barlow Condensed 700-800 caps, 0.8-1.05rem, 0.06em tracking, 0.08em for meta): nav, buttons (0.95rem, 800), running head (0.95rem, 0.08em), stats labels and links.
- **Chip** (Barlow Condensed 700 caps, 0.78rem, 0.06em tracking): fact and track chips.

### Named Rules
**The Two-Line Headline Rule.** A game's title breaks at its subtitle colon ("Metaphor:" / "ReFantazio"). Without a colon it breaks before the last word, and a one-word title is all second line. The second line takes the track's accent: yellow for a GOTM winner, soft violet for an NR-GOTM winner, paper for everything else. Every page that sets a game's name as a headline uses this one rule.

**The Caps Are the Face Rule.** Anton and Barlow Condensed are always set in caps through the `font-headline` and `font-label` utilities. Anton never sets mixed case, and it never sets body text.

**The Earned Over Total Rule.** In the Achievement Hub a count reads as an Anton numeral with its total beside it in paper-mute ("23 / 41"): a set header sets it at numeral scale, the binder index and club pages at 1.25-1.5rem. A member's Unlocks are the binder's monumental numeral (4.5rem to 5.25rem), with Completions, Masteries, Platinums and RA points as 2rem Anton over label captions. Slot numbers are two-digit Anton ("07").

## Layout

The app shell is a left sidebar (collapsible to icons; an off-canvas sheet on phones) beside a 60px sticky top bar (ink at 95% with a light backdrop blur and a rule beneath), with page content under it. Content gutters are 16px on phones and 28px from `sm`, with 24px top padding. Content spans the area beside the sidebar up to one shared maximum of 120rem (the `--container-page` token, `max-w-page`) and centers past it; the frame owns that width, so pages don't set their own outer width. Full-bleed banners (game hero, game strip, review banner) use the `bleed` utility to break out of the frame to the full width beside the sidebar. Only limits that serve one piece of content (a reading measure, a diagram, a podium, a small callout) cap their own width. Departments stack 40px apart. Grids use 20px gaps; tight clusters (chips, links) use 6-8px.

The dashboard is a two-column issue from `lg`: the cover story fills the flexible column and a 23rem right rail holds the NR feature over the yellow round panel. The previous-rounds strip runs below. Below `lg` everything stacks.

**The Empty Track Rule.** A track with no winner gives its space away rather than apologising for it. On the dashboard, with no NR-GOTM the yellow round panel takes the whole right column at full height and lists the latest nominations. With no GOTM, the NR-GOTM is promoted to the cover in violet, with one small "No Game of the Month this round" note under the numeral. In the GOTM history ledger, where rows must align, an absent track keeps its column as a dashed rule-strong box with a short muted label. Under a title search, that box stays silent, because absence there means "no match".

**The Multi-Winner Rule.** Co-winners share one cover, never a carousel. Two winners split it (1.42fr / 1fr). Three put a tall lead panel beside two stacked panels (1.3fr / 1fr). The lead carries the numeral, a paper "N winners" tag and every outbound link, and the narrow panels keep two links. Each winner gets a square letter tile (A, B, C) in its track's ink, and titles step down by panel size. The NR rail does the same: one winner is a feature card, and two or three are a ranked list of covers with A/B/C letters. Side-by-side panels reserve equal blurb height so their stats and actions sit level.

**The Open Binder Rule.** A member's achievements open as a binder: a rule-coloured cover with 4px corners and a deep object lift, holding two ink-2 pages. From `xl` it is a 25rem left page (the member, their totals, Linked Accounts and four rarest Unlocks), a 30px gutter of rings, and the index page. Filter tabs (status, then one per Linked Account's Provider) sit on the binder's top edge, and each index row's game-tint tab sticks out past the binder's right edge. Below `xl` the binder closes to one page with the member first and the index below.

**The Spread Rule.** A set page is a two-page spread: from `xl` the left page (1.7fr) holds the view (Checklist, Rarity or Timeline) and the right page (at least 20rem) holds the picked Achievement's details over the Rarity tally, sticky under the top bar. The pages meet at a shadowed gutter. Game-tint view tabs sit on the spread's top edge. On phones the spread closes to one page and the details open under the picked item.

**The Day Band Rule.** The hub runs newest first in UTC day bands, each headed by a paper-tape label with a rule running out to its tally. From `xl` the Latest wall takes 62% beside a 38% rail of this week's Highlights. The wall is two columns from `sm`, and a card holding a Highlight spans both, as does a day's odd card out, so the wall never ends on a hole. The Highlights wall alone runs 2 to 6 columns without day bands, each tag carrying its own date.

## Elevation & Depth

The system is flat with tonal layering: ink, then ink-2 for panels, then ink-3 for wells. Depth on art surfaces comes from black legibility scrims over full-bleed key art, never from glow. Shadows are soft, black and directional, and they appear only on objects that physically sit on the page: the starburst, a dealt pick card, a member avatar, the lifted cover in a filmstrip.

### Shadow Vocabulary
- **Stamp shadow** (`drop-shadow(0 6px 14px rgba(0,0,0,0.45))`): the starburst.
- **Object lift** (`box-shadow: 0 12px 30px rgb(0 0 0 / 0.5)` up to `0 24px 60px rgb(0 0 0 / 0.6)`): dealt cards, covers lifted in a reel, the banner avatar.
- **Type-on-art shadow** (`text-shadow: 0 1px 8px rgb(0 0 0 / 0.85)`): small labels sitting directly on key art.
- **Inset ring** (`box-shadow: inset 0 0 0 1-2px <rule-strong | paper-mute | highlight>`): strokes without layout shift; yellow marks a selection, including the current option in the hub's controls and the picked Achievement in a set view.
- **Die-cut rest** (`0 3px 6px rgb(0 0 0 / 0.45)`, up to `0 8px 16px rgb(0 0 0 / 0.55)` at larger sizes): an unlocked icon sitting on its slot, fanned icons and pinned Highlights. The foil stamp and an odds tag take the stamp shadow's soft drop.
- **Gutter shade** (`inset ±18-22px 0 22-26px -14 to -20px rgb(0 0 0 / 0.7)`): binder and spread pages darken into the gutter where they meet.
- **Tab lift** (`4px 4px 10px rgb(0 0 0 / 0.45)`): an index row's tint tab standing proud of the binder's edge.

### Named Rules
**The Scrim Not Glow Rule.** Key art is darkened from where the type sits (from the left for a single cover, from the foot for split panels) with ink gradients (`rgb(11 11 13 / 0.96 to 0.15)`). Art is never faded into a coloured gradient, and nothing glows.

## Shapes

The form language is hard rectangles. Chips and tags take 2px (`rounded.xs`). Buttons, inputs, covers and nav items take about 2.4px (`rounded.sm`). Panels and covers take about 3.2px (`rounded.md`), all from a 0.25rem base radius. The only round forms are avatars and status dots. Covers carry a 1px inset paper outline at 12% so dark art holds its edge on ink. Headings sit on a 2px solid paper rule. Spines on profile shelves have slightly uneven, stable heights so a shelf never reads as a bar chart.

**The Die-Cut Rule.** Achievement icons are die-cut objects, so they alone round to 6px (`rounded.die-cut`). The ring frame around a tile on a game's club page follows the cut at 7-8px. Everything else in the Achievement Hub keeps the hard rectangle: chips and stamps at 2px, tabs and tint bands at about 3.2px, the binder cover at 4px. Its round forms are the slot dots, the member ring dots, the PSN tier dot and avatars.

**The Hand-Placed Rule.** Objects that sit on the page rest at a tilt and pages stay square. An unlocked icon takes a stable tilt from its id (within ±1.5deg) and straightens on hover. A foil stamp is pressed at -8deg, an odds tag at 6deg, a day tape at about 1deg alternating, and a hand of fanned icons leans by position. A hidden tile is sealed by a diagonal band in the game tint, and a day tape has torn edges.

## Components

### Buttons
Blunt, label-voiced and loud.
- **Shape:** near-square (rounded.sm), 36px tall, 14px side padding, Barlow Condensed 800 caps at 0.95rem, with a 16px icon at the inline end ("View game →") or inline start.
- **Primary (default):** masthead red with white type. It is for GOTM actions only; on hover it drops to 85% red.
- **Highlight:** yellow with ink type, for calls to action (nominate, vote).
- **NR:** violet with white type, for NR-GOTM actions.
- **On a yellow panel:** ink with paper type for the main action, and an ink-outlined transparent button beside it.
- **Outline:** a 1px paper-mute/60 stroke, transparent, paper type; on hover the stroke goes paper and the fill ink-3.
- **Link:** paper type with a 2px red underline offset 4px; it turns yellow on hover.
- **Destructive outline:** a signal-orange stroke with orange type on transparent; on hover a 10% orange wash. It is the button that opens a destructive action's confirm (Delete, Reset votes, Close now).
- **Destructive solid:** signal orange with orange-ink type; on hover it drops to 85%. It is the confirmed destructive action, after the typed-word confirm. Destructive never uses masthead red.
- **Focus / Active:** a yellow focus ring (3px at 50%); pressing nudges the button down 1px. Outbound text links ("Reddit ↗") are small label-voice links in paper-dim that turn yellow on hover.

### Chips
- **Style:** 24px tall, 2px corners, 8px padding, chip type. The neutral chip (year, platform, studio, role) is paper at 8% with paper-dim text.
- **Tones:** gotm (red/white), nr (violet/white) and highlight (yellow/ink, for "Your pick" and badges). Only a track's own fact wears its ink.

### Cards / Containers
- **Corner Style:** rounded.md.
- **Background:** ink-2 on ink, with an optional 1px rule border. A track is marked by a 3-4px bar in its ink: the NR feature card's top edge, and the foot of a pick's art.
- **Internal Padding:** 16-28px (20px on narrow panels, 28px on the cover from `sm`).
- **Empty states:** a dashed rule-strong border with a short muted line ("Nothing in progress right now.").

### Inputs / Fields
- **Style:** 36px, ink-2 fill, 1px rule (or rule-strong) stroke, rounded.sm, a muted 16px leading icon, and a muted placeholder.
- **Focus:** the stroke shifts to paper-mute (top-bar search) or yellow with a soft yellow ring (editors). The caret is yellow.

### Navigation
- **Sidebar:** the wordmark in Anton ("The **RPG** Club", with RPG in red). Items are 40px tall, label type at 1.05rem in paper-dim with 18px line icons. Hover fills ink-3. The active item is solid masthead red with white bold type. Voting carries a yellow phase badge when a round is open.
- **Running head (top bar):** the current route as a trail (e.g. GAMES / <TITLE> / REVIEWS), in label type at 0.95rem with 0.08em tracking. Parent crumbs are paper-mute links that go paper on hover, separators are red slashes, and the current page is paper. Middle crumbs truncate first, at 14rem. On phones, only the page and its parent show. The trail is resolved on the server through the `@crumbs` parallel slot and replaces every in-page breadcrumb. The search field sits at the right (w-80, w-36 on phones) and lands on /games.

### Cover Story (signature)
Full-bleed key art under an ink scrim, with the monumental round numeral in the track's ink, "Round N / Month Year" beside it, then the two-line headline, fact chips, a three-line blurb, the club's stats (Anton numerals over label-type captions, the first in the track's accent: playing, cleared, reviews), the track button and outbound links. Art scales to 1.03 on hover over 700ms (`cubic-bezier(0.2,0.8,0.2,1)`).

### Winner Starburst (signature)
A 26-point SVG burst set at a tilt (default -9deg, never square), lettered in Anton. The GOTM burst is yellow with ink type ("Game / of the / Month"). The NR burst is violet with white type ("Non-RPG / Game of / the Month"). At badge scale on grids it reads "GOTM". It appears only on GOTM and NR-GOTM winners. It stamps in once per page (480ms, `cubic-bezier(0.16,1,0.3,1)`, from 1.5x scale and 14deg off-tilt), and repeated bursts in a grid are `still`. Reduced motion skips the stamp.

### Round Panel / Voting Strip
The club's open business in yellow: the "Round N / Nominations | Voting | Results" headline in Anton, a monumental days-left count, one line of status, and ink-on-yellow actions. When tall, it lists the latest five nominations, each with a 2px-cornered GOTM or NR tag. The /voting strip uses the same yellow, with a clock column and one slot per track for the member's own nomination or votes.

### Game Cover (image fallback)
Box art at 3:4 with rounded.sm and a 1px paper/12 inset outline. When a game has no art, the cover is an ink-3 block with the title set in Anton caps in paper-mute, centred. It is never an empty grey rectangle or a stand-in image. Cover stories without art fall back to their ink scrim on black and keep their full typographic layout. The landing marquee renders only with real winners' art and shows nothing rather than stand-ins.

### Shelves and Spines (profile)
Lists not being read are a bookcase. Each shelf has a monumental count and an Anton title on the left, and closed spines with titles set sideways on the right. Favorites ranked 1-3 stand on a podium (first in the middle and highest); rank 4 and lower sit level on the shelf. Now Playing sits above the case as open books, face-on.

### Achievement Icon (die-cut, signature)
An Achievement's icon as a die-cut tile resting in its slot, at four sizes (40, 56, 80 and 128px; the edge is 3px, 5px at the largest). It is decorative: its name is always set beside it.
- **Unlocked:** the art on ink-3 inside a die-cut edge in its Rarity ink (paper-mute when the Provider gives no Rarity), at its stable tilt, with the die-cut rest shadow. The Unlock behind a Platinum, Mastery or Completion takes a foil edge instead. A PSN trophy carries a corner dot in its tier's metal (foil for Platinum), and a RetroAchievements hardcore Unlock carries a small paper "HC" tag. Without art the tile fills with the game tint and shows the slot number in Anton in the tint's contrast colour.
- **Locked:** the empty slot, a 1.5px dashed rule-strong outline with the two-digit slot number in Anton in the game tint at 60%.
- **Hidden:** a sealed ink-3 tile with a rule-strong stroke, crossed by a diagonal band in the game tint, with an Anton "?" and, at large sizes, a "Hidden" label. Its name stays blurred until the viewer reveals it.

### Foil Stamp
A Completion, Mastery or Platinum lettered in Anton ink on foil, pressed at -8deg with an inset ink outline and the stamp shadow, at three sizes. It sits on the corner of a set's title band, at the end of a binder index row, and over a Highlight.

### Rarity Chip and Provider Chip
Both are solid chips at the chip scale with ink type (20px tall at the small size). The Rarity chip reads "Ultra rare · 2.1%", adding a hardcore figure where RetroAchievements has one. Below the chip, Rarity is printed in label type as "2.1% of players". The Provider chip reads the Provider ("RA", "Steam", "PSN" in tight rows). As a Linked Account chip it carries the member's name on that Provider in Barlow.

### Game Tint: Spine, Band and Tabs
- **Spine:** a 10-14px tint strip down the left edge of a set's page or a hub card.
- **Band:** a solid tint block behind a game's title, in Anton set in the tint's contrast colour. It is the set page's masthead at 2.5-4rem, sitting on the 2px paper rule, and a 1.45rem link on hub cards.
- **Tabs:** the set page's view tabs (Checklist, Rarity, Timeline) sit on the spread's edge. The current tab is a taller tint tab, and the others are ink-2 tabs in paper-mute that go ink-3 on hover. The binder's index rows each carry a tint tab past the binder edge, numbered from `xl`.

### Binder
- **Totals:** the left page's monumental Unlocks numeral and a four-column row of secondary counts.
- **Index row:** the two-digit row number in the tint, the set's title in Anton (it turns yellow on hover), a short Provider chip, then earned / total and a foil stamp once complete, or the percentage. A strip of 7px slot dots runs beneath: earned dots in the tint first, the rest dashed paper-mute.
- **Filter tabs:** status tabs are ink-3, and the current one is ink-2 with a 2px paper top edge, carrying its count. Provider tabs are solid in their colour. Once one is picked, the others drop in height.
- **Rings:** 4 to 12 metal rings down the gutter from `xl`.

### Hub
- **Day tape:** the day's label in extra-bold label type on torn paper tape, slightly tilted, with a hairline running out to a paper-mute tally.
- **Latest card:** one member's Unlocks in one set on one day, on a tint spine, with up to five icons fanned like a hand of cards. A card holding a Highlight doubles: its lead Unlock sits large under a foil stamp or an ultra-rare odds tag, and the rest shrink to a strip of Rarity-ink dots.
- **Highlight tile:** the Unlock large and tilted, the stamp or odds tag pressed over it, the member's avatar on its corner, and a paper tag beneath edged in the tint (left) and the Provider colour (top).
- **Controls:** a view switch and Provider chips as plain links. The current option carries the yellow inset ring.

### Club Set Page (game page)
One composite page per Provider behind Provider tabs. A tab carries a 3px top rule in its Provider colour and fills solid when active, so it joins the page's Provider-coloured top rule. The page has a tint spine. Each Achievement is faded by how few members hold it and ringed by a dot per member (filled in that member's ring colour when they hold it), opening on hover, focus or tap to the members who unlocked it. The members who completed the set sign the margin on foil, oldest first. The viewer's own earned / total links to their set page.

### Production desk (staff surfaces)
The /admin area is a production desk: the club's staff put the next issue together. It is a staff surface only; members never see it. Every desk page opens with the desk header and keeps the Two-Line Headline and paper-rule habits of the rest of the site.
- **Desk header:** the page name big in Anton on the 2px paper rule, with a short label-voice note on the right (who is at the desk, a count, the viewer's time zone) that wraps under the title on a phone.
- **Contents page:** the /admin landing. The viewer's tools grouped by area, each a link, a dot leader and a live note where a magazine prints the page number ("Round 143 open", or "Failed 1 h ago" in signal orange). Each role sees only its own groups.
- **The wire:** bot jobs newest first, each a slip with its clock and day, what it did, who asked (Admins and up) and a stamp. A failed slip quotes the bot's error under a dashed rule in signal orange; a done one quotes what the bot reported. No retry buttons: a failed job stays failed.
- **Stamps:** Queued in highlighter yellow, Done in done green, Failed in signal orange, as a 2px (wire) or 3px (proof) inset outline in Anton, tilted 4 degrees. The proof's stamp presses in with the starburst's stamp motion when its phase changes, behind `motion-safe`.
- **Proof card:** a form's preview of what the bot will post (a poster, a message, a round), set beside the form. Once sent it is stamped Queued in its corner, the stamp follows the bot job to Done or Failed, and the job's status line sits under it.
- **Typed confirm:** a destructive action confirms by typing the words shown, in a dashed signal-orange box with its label cut into the border. The solid orange button stays off until the words match.
- **Dictionary list and Undo bar:** lists and editors file entries under big letters in two columns with an A to Z jump bar. Delete strikes the entry through and holds it behind an Undo bar, a signal-orange bar that drains over the hold; the request is sent only when the bar runs out.
- **Date ruler (voting console):** the round as a ruler of dates: nominations opening, the vote, any runoff, today in red, and the yellow Next vote pin. The pin drags in whole days and steps with the keyboard, and a plain date field beside it sets it too. Below md the ruler is left out (as in the chosen mock) and the console leads on the round numeral; the date field still sets the pin.

**The Desk Green Rule.** Done green (`ok`) shares the hex of the uncommon Rarity ink because the two never meet: Rarity inks stay on achievement surfaces and done green stays on the staff desk, which shows no achievements. It is its own token so neither role borrows the other, and it is still a mark (type, a stamp outline, a dot), never a fill behind type.

## Do's and Don'ts

### Do:
- **Do** colour a thing red only if it is GOTM or "you are here", violet only if it is NR-GOTM, and fill it yellow only if it is a call to action or the GOTM starburst.
- **Do** open every page with one monumental object (a numeral or a two-line Anton headline) and rule every heading with 2px paper.
- **Do** set every game headline with the Two-Line Headline Rule.
- **Do** give an absent track's space to what remains (the yellow panel or the promoted NR cover) on the dashboard.
- **Do** split one cover between co-winners and letter them A, B, C in the track's ink.
- **Do** fall back to the title in Anton on ink-3 when art is missing.
- **Do** keep motion to the single starburst stamp, gentle art scale on hover (1.03-1.04, 500-700ms), the landing marquee and, in the Achievement Hub, an icon straightening from its tilt on hover (200ms), all behind `motion-safe`.
- **Do** keep the Achievement Hub's colour roles (game tint, Rarity inks, Provider colours, foil) on achievement surfaces, and set every tint with its contrast type.
- **Do** keep foil for Platinum, Mastery and Completion.
- **Do** use the glossary in achievement copy: Achievement, Achievement Set, Unlock, Highlight, Rarity, Completion, Mastery, Platinum, Provider, Linked Account.

### Don't:
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
