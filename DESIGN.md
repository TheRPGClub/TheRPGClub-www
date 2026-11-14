---
name: The RPG Club
description: The floor every website Theme meets. Each Theme's own look lives with that Theme.
---

# Design System: The RPG Club

The website's look is a **Theme** (api ADR-0008, "Themes restyle shared components with CSS only"). A Theme is one folder under `themes/` holding its stylesheet, its fonts, its assets and its own design rules. This document keeps only what every Theme must honour, and how Themes plug in.

The default Theme is **Monthly Issue**: its design rules, palette and the palette-to-token mapping are in [`themes/monthly-issue/README.md`](themes/monthly-issue/README.md).

## The Theme floor

Every Theme meets all four, on every surface, in its declared mode. A Theme that cannot meet one with the shared components asks for a decorative slot, never a fork (ADR-0008).

1. **Contrast.** Text clears 4.5:1 against the surface it sits on, at every size, including type on club-colour fills, chips, scrims and disabled-but-readable states.
2. **Visible focus.** Every focusable element shows a focus indicator under `:focus-visible` that is clearly distinct from its unfocused and hovered states. A Theme may restyle the indicator, never remove it.
3. **Reduced motion.** With `prefers-reduced-motion: reduce`, nothing moves beyond opacity fades: animation and transform transitions sit behind `motion-safe`, or are switched off under `motion-reduce`.
4. **Target size.** Every pointer target is at least 24 by 24 CSS pixels, or has 24px of clear spacing around it.

## How Themes plug in

- **Tokens.** `app/globals.css` holds the token map: every role-based, club-colour, shape and type token, as a Tailwind key reading the Theme's custom property (`--color-background: var(--background)`). A Theme sets those properties on `[data-theme="<name>"]`, inside `@layer themes`, which sits above Tailwind's utilities. Components use the token names only (`bg-card`, `text-dim-foreground`, `border-border-strong`, `bg-gotm`), never a Theme's own palette names (`structure/no-palette-colors`).
- **Three colour tiers.** Surface and text roles are what a Theme is. Club colours (GOTM, NR, highlight, Rarity, and their `-foreground` pairs) may change but stay distinct from each other and readable. Provider brand colours, PSN tier metals, the logo's brand ramp and the sampled game tint are fixed in `app/globals.css`, outside every Theme.
- **Mode.** Each Theme declares light or dark in `themes/registry.ts`. The root layout puts `data-theme` and `data-mode` on `<html>` on the server; `data-mode` sets `color-scheme` and drives shadcn's `dark:` variant.
- **Fonts.** A Theme's fonts load through `next/font` in its own `fonts.ts`, with `preload: false` unless it is the default Theme, so a Member pays only for the Theme they see.
- **Primitives.** A Theme restyles a shadcn primitive by its `data-slot` and `data-variant` attributes. Variants name what a thing is (`tone="gotm"`, `variant="inverse"`), never how it looks.
- **The test Theme.** `DEV_THEME=test npm run dev` swaps every token for a loud colour (development only). Any surface that still looks like the Monthly Issue names a palette colour or a hex instead of a token.

### Adding a Theme

1. Create `themes/<name>/` with `theme.css` (every token the Monthly Issue Theme sets, scoped to `[data-theme="<name>"]` in `@layer themes`), `fonts.ts` if it needs its own faces (`preload: false`), any assets, and a `README.md` with its rules.
2. Import `theme.css` from `app/globals.css` and add the Theme to `themes/registry.ts` (and its font classes to `themes/index.ts`).
3. `npm test` checks that it sets every token. Check it against the floor above.
