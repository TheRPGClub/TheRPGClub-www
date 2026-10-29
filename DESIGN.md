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
---

# Design System: The RPG Club

## Overview

**Creative North Star: "The Monthly Issue"**

Every Game of the Month round is an issue of the club's own 90s game magazine. The GOTM winner is the cover story, the Non-RPG pick is the feature, the club's open business (nominations, the vote) is a highlighter-yellow insert, and every other page is a department: GOTM history is the archive, a member's profile is their bookcase, a game page is its own cover story. The voice is loud and printed: ink-black stock, condensed caps set big, three spot inks that each mean one thing.

Density is magazine density, not dashboard density. A page leads with one monumental object (a round number, a game's two-line headline, a member's name in Anton at banner scale), then settles into ruled departments with labels in tracked condensed caps. Surfaces are hard rectangles with barely-there corners. Depth comes from key art under black legibility scrims, not from glowing cards.

The world refuses the default dark game-tracker: gradient-faded key-art cards, glow accents, gradient text. The app is dark-only (`<html class="dark">`, theme colour #0b0b0d).

**Key Characteristics:**
- Ink-black ground with three spot inks: masthead red for GOTM, violet for NR-GOTM, highlighter yellow for the member's own business.
- Anton in caps for every headline and numeral, Barlow Condensed tracked caps for every label, Barlow for reading.
- Monumental numerals: the round number, a shelf's count, the days-left clock.
- The winner starburst, stamped once, only on winners.
- Two-line game headlines, with the second line in the track's accent.
- Hard rectangles (2-4px corners) and 2px paper rules under headings.

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

### Named Rules
**The One Ink Per Track Rule.** Red means GOTM, violet means NR-GOTM, and nothing decorative borrows either. A GOTM element never wears violet and an NR element never wears red. A game that won both tracks reads as GOTM first.

**The Yellow Is Yours Rule.** Highlighter yellow is filled only for calls to action and the GOTM starburst. As type it marks the GOTM headline's second line and interaction states (hover, focus, selection, caret). It never fills a decorative panel.

**The Red Is Also Here Rule.** Besides GOTM, masthead red marks where you are: the active sidebar item and the running-head separators. It marks nothing else.

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

## Layout

The app shell is a left sidebar (collapsible to icons; an off-canvas sheet on phones) beside a 60px sticky top bar (ink at 95% with a light backdrop blur and a rule beneath), with page content under it. Content gutters are 16px on phones and 28px from `sm`, with 24px top padding. Departments stack 40px apart. Grids use 20px gaps; tight clusters (chips, links) use 6-8px.

The dashboard is a two-column issue from `lg`: the cover story fills the flexible column and a 23rem right rail holds the NR feature over the yellow round panel. The previous-rounds strip runs below. Below `lg` everything stacks.

**The Empty Track Rule.** A track with no winner gives its space away rather than apologising for it. On the dashboard, with no NR-GOTM the yellow round panel takes the whole right column at full height and lists the latest nominations. With no GOTM, the NR-GOTM is promoted to the cover in violet, with one small "No Game of the Month this round" note under the numeral. In the GOTM history ledger, where rows must align, an absent track keeps its column as a dashed rule-strong box with a short muted label. Under a title search, that box stays silent, because absence there means "no match".

**The Multi-Winner Rule.** Co-winners share one cover, never a carousel. Two winners split it (1.42fr / 1fr). Three put a tall lead panel beside two stacked panels (1.3fr / 1fr). The lead carries the numeral, a paper "N winners" tag and every outbound link, and the narrow panels keep two links. Each winner gets a square letter tile (A, B, C) in its track's ink, and titles step down by panel size. The NR rail does the same: one winner is a feature card, and two or three are a ranked list of covers with A/B/C letters. Side-by-side panels reserve equal blurb height so their stats and actions sit level.

## Elevation & Depth

The system is flat with tonal layering: ink, then ink-2 for panels, then ink-3 for wells. Depth on art surfaces comes from black legibility scrims over full-bleed key art, never from glow. Shadows are soft, black and directional, and they appear only on objects that physically sit on the page: the starburst, a dealt pick card, a member avatar, the lifted cover in a filmstrip.

### Shadow Vocabulary
- **Stamp shadow** (`drop-shadow(0 6px 14px rgba(0,0,0,0.45))`): the starburst.
- **Object lift** (`box-shadow: 0 12px 30px rgb(0 0 0 / 0.5)` up to `0 24px 60px rgb(0 0 0 / 0.6)`): dealt cards, covers lifted in a reel, the banner avatar.
- **Type-on-art shadow** (`text-shadow: 0 1px 8px rgb(0 0 0 / 0.85)`): small labels sitting directly on key art.
- **Inset ring** (`box-shadow: inset 0 0 0 1-2px <rule-strong | paper-mute | highlight>`): strokes without layout shift; yellow marks a selection.

### Named Rules
**The Scrim Not Glow Rule.** Key art is darkened from where the type sits (from the left for a single cover, from the foot for split panels) with ink gradients (`rgb(11 11 13 / 0.96 to 0.15)`). Art is never faded into a coloured gradient, and nothing glows.

## Shapes

The form language is hard rectangles. Chips and tags take 2px (`rounded.xs`). Buttons, inputs, covers and nav items take about 2.4px (`rounded.sm`). Panels and covers take about 3.2px (`rounded.md`), all from a 0.25rem base radius. The only round forms are avatars and status dots. Covers carry a 1px inset paper outline at 12% so dark art holds its edge on ink. Headings sit on a 2px solid paper rule. Spines on profile shelves have slightly uneven, stable heights so a shelf never reads as a bar chart.

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

## Do's and Don'ts

### Do:
- **Do** colour a thing red only if it is GOTM or "you are here", violet only if it is NR-GOTM, and fill it yellow only if it is a call to action or the GOTM starburst.
- **Do** open every page with one monumental object (a numeral or a two-line Anton headline) and rule every heading with 2px paper.
- **Do** set every game headline with the Two-Line Headline Rule.
- **Do** give an absent track's space to what remains (the yellow panel or the promoted NR cover) on the dashboard.
- **Do** split one cover between co-winners and letter them A, B, C in the track's ink.
- **Do** fall back to the title in Anton on ink-3 when art is missing.
- **Do** keep motion to the single starburst stamp, gentle art scale on hover (1.03-1.04, 500-700ms) and the landing marquee, all behind `motion-safe`.

### Don't:
- **Don't** fade key art into coloured gradients, add glow accents, or use gradient text.
- **Don't** put a starburst on anything but a GOTM or NR-GOTM winner.
- **Don't** put a breadcrumb inside a page; the running head is the only trail.
- **Don't** add a small tracked-caps kicker or eyebrow above a headline. Track labels sit with a pick's art as data, not above titles as decoration.
- **Don't** use hard offset shadows; shadows here are soft, black and directional.
- **Don't** use emoji or text glyphs as icons; icons are line SVGs (Lucide) at 16-18px.
- **Don't** set Anton in mixed case or at body sizes, or set body copy in Barlow Condensed.
- **Don't** round corners past 4px except avatars and status dots.
- **Don't** call the GOTM history "Back issues".
