# Frutiger Aero

The club's second Theme (spec api#523): light mode, key `aero`, the mid-2000s Frutiger Aero look. Glossy, glassy and optimistic: round white glass windows over a sunlit lagoon, Vista gel on every control, nature living with clean technology. It sits on top of the Theme floor in `DESIGN.md` (contrast, focus, reduced motion, target size), which it meets everywhere, glass over the scene included. Approved as rendition O (www#251; mocks in `.impeccable/mocks/decision/themes/`, `themes/h.css` and `themes/o.css`, sketchbook `sketchbook/primitives.html`).

## Rules

- **Upright only.** Nothing tilts: no `rotate` or `skew` on content, no sideways or vertical text. Where Monthly Issue leans a starburst, a flyer or a stamp, Aero sets it straight.
- **No paper props.** No sticky notes, tape, pins, push-pins, paper clips, torn edges, index-card rules, rubber stamps, scalloped stickers or pinboards. A component keeps its job, content and structure, never its paper costume: it is made of Aero's own materials instead.
- **Round glass.** Controls are pills, windows are generously rounded (`--radius` 1.125rem), avatars and status dots are circles.
- **Vista gel** on every control that acts: a bright upper half stopping on a hard line, a deeper body, a glow pooling at the foot.
- **Coloured panel tops blend into the glass.** A panel's ink is a tint in the top of its glass, gone by the end of its head, never a hard rule.
- **The logo image never changes.** The `logo-halo` ornament frames it in a glass bubble.
- Signed-out pages (the landing, `/join`, public Club History) and the Share Card always wear Monthly Issue, so Aero has no Join Panel or Cover Slideshow.

## Colours

Tokens are in `theme.css`; every pair clears 4.5:1.

- **Ground and type:** pale sky `background` #eef7fb, white `card`, deep-lake `foreground` #0f3047 (12.6:1), `dim-foreground` #36556a, `faint-foreground` #4f6a7d (5.2:1).
- **GOTM is sky blue** #1769bd, **NR-GOTM leaf green** #2a7d22, both with white type. Each owns its colour, as in every Theme.
- **Highlight is sunlight amber** (#ffc93a, deep-lake type): the member's own business, as a gel (the amber gel) or a slab (`--aero-amber-gel`). As type on white it is `--aero-amber-ink` #8a5300.
- **Destructive is red** #c62f1f, free under Aero because GOTM is blue.
- **Success and done are lagoon teal** `ok` #0b8ea6 (as type `--aero-ok-ink` #07707f), clearly apart from the NR green.
- **Provider colours stay fixed** (`app/globals.css`).
- The area inks (news, kinds, phases, formats, codex, panels) are deep saturated hues, because components read each both as type on the ground and as a fill under ground-coloured type. Region and Rarity tints are pastel gels under deep-lake type.

## Type

Nunito (display: headlines and numerals, weight 900, mixed case) and Nunito Sans (body and labels, weight 700 labels, never in caps), both OFL, loaded in `fonts.ts` with `preload: false`.

## Materials

The private custom properties in `theme.css` (`--aero-*`) are the materials; `primitives.css` and `shell.css` read them.

- **Gel** (`primitives.css`, "Aero materials"): one recipe, `--gel-top/base/bottom/glow/edge/shade` and `--glare-hi/lo` per member. Deep gels (GOTM blue, NR green, deep lake, red) carry white type with an etched shadow; amber and pale gels carry deep-lake type.
- **Clear glass** for quiet buttons (outline, search, overlay, back links): `--aero-gloss` over translucent white with a stroke.
- **Wells** for fields: recessed glass (`--aero-well`).
- **Panes** for dialogs, sheets, popovers and menus (`--aero-pane`, `--aero-pane-shadow`).
- **Windows**: `--aero-glass` with `--aero-edge` and the daylight shadow `--aero-day`.
- **Focus** is a 2px blue outline on a white halo (`--aero-halo`), visible on glass and on the scene.

## The shell and the scene (`shell.css`)

- **The `backdrop` ornament** draws the lagoon at the waterline behind the whole app: sky and cumulus, rolling hills, a glass skyline, a meadow bank, lily pads; under the line light shafts, fish, jellyfish and a reef. Caustics live in the water only and breathe slowly; Wii fog ribbons drift between the far scene and the content; bubbles rise in the water; a glass globe pours into the lagoon (seen through the sidebar's glass); a dolphin leaps by the content's right edge (not on tablets); leaves enter at two corners and the right waterline. Art and its provenance: `assets/` and `assets/PROVENANCE.md`.
- **The frosted sidebar**: the scene seen softly through glass, frost thick behind the brand, the nav and the account, thin below the nav. Its collapse control is a pearl gel key on a small glass plate; collapsed, the logo bubble is the expand key and shows the panel icon on hover or focus. **The phone tab bar** is the same frost; the current tab carries a blue gel bar on its top edge.
- **The `glare` ornament**: a curved gloss over the key art. On the Cover Story, C's sheen band crosses it on hover or focus and once every 16 seconds; on a game hero it is a still gloss on the art side, under the title.
- **No veil: glass windows.** The page has no glass of its own: every section, heading, strip and note sits in its own window (white glass at 92% or more, `--tpl-window` and the areas' own), so every word clears 4.5:1 over any part of the scene, and the scene shows between the windows. On the dashboard the band under the issue stays open for the waterline, the splash and the dolphin (`dashboard-issue`, `issue-spread`). A new section on the scene needs its own window.

## Motion

Ambient motion (caustics, fog, bubbles, the sheen) runs only under `prefers-reduced-motion: no-preference`. Hover and press feedback is a brightness and shadow change.

## Not yet done here

The signature components that bake in tilts, vertical text, paper props or fixed sizes (about 30: the Cover Story's headline and scrim, the Winner Starburst as a bubble, flyers, spines, the binder, the fun fact card...) get their hooks and Aero looks area by area in www#255-259. Until then they render in tokens, upright where `primitives.css` reaches them, and may still lean or wear paper.
