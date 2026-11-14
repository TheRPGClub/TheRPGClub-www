---
version: 1
slug: "app-protected-settings-page-tsx"
primary_target: "app/(protected)/settings/page.tsx"
related_targets: ["components/feature/feature-preferences-form.tsx","components/feature/feature-switch.tsx","components/feature/news-category-switches.tsx"]
---

# Surface: /settings (member Feature Preferences and News Category Preferences)

Mode: Operate. Scope: ordinary extension inside the established DESIGN.md world (www#74, spec api#347; News Category switches www#78, spec api#355).
Audience/job: any signed-in member tidying their own view of the site; Admins and Superadmins also previewing it as members see it.

## Direction contract

THESIS: A settings page is one more department of the magazine: the SETTINGS headline on its paper rule, a FEATURES department, and plain switch rows. It refuses the generic settings template of grouped cards, icons per row and a sticky save bar.

OWN-WORLD: Ink ground, Anton headline and section title on 2px paper rules, Barlow Condensed caps for row names and switch state, Barlow dim for the "where it shows up" line, 1px rule hairlines between rows. The switch is a hard-cornered 44x24 track: highlighter yellow with an ink block when shown (the member's own choice), ink-3 well with a muted block when hidden.

STORY: The member reads one line (hidden parts leave nav, dashboard and other pages; links still work), flips what they don't use, and sees the sidebar follow at once.

FIRST VIEWPORT: SETTINGS headline, FEATURES title, the explanatory line, then one row per Live hideable Feature (name, where it shows up, Shown/Hidden switch on the right), capped at 42rem. Staff: Preview rows carry the highlight Preview chip; a "Show Preview features" switch sits below on a raised ink-2 panel with a Staff chip. No Live hideable Feature: a dashed rule-strong box with one short line replaces the list. No preview column, no Core list (user's changes to the locked pick).

FORM: Locked pick "Switches" (`.impeccable/mocks/decision/settings-preview.html`) minus its preview column and Always shown list; seed:0bc3420403d3e527 (dealt option 1, "Switches + live preview", from the feature-flags decision round's surface roll; the user locked it and removed the preview column and the Always shown list). Signature interaction: save on flip; the block slides 200ms (motion-safe), the label reads Saving while the API answers, and a failed save springs back with the reason under the row.

NEWS CATEGORIES (www#78, locked pick "Indented list", `design/picks.md` of the News Hub spec; no mock, built from the pick's description): the first per-Feature sub-setting, kept to plain switches. Under the News Hub row, inside its list item: a 1px paper-mute left rule (not a coloured border-left accent), one Barlow dim line ("Categories you see by default. Off ones stay in the News page filter."), then one row per News Category in the API's order: a 16px News ink square (Rumours carries a dashed inner edge, unconfirmed), the category name in the row-name label type, and the page's own switch reading On/Off on the right, rows split by 1px rule hairlines. The ink square names the category; the switch carries on and off, and an off row's name drops to paper-dim like a hidden Feature's. Same save-on-flip, Saving, spring-back-with-reason behaviour as the Feature rows, per row. While the News Hub row reads Hidden (optimistic included) the block stays in place but dimmed and inert (switch `aria-disabled`, 45% opacity, no hover, not-allowed cursor; names paper-mute; squares 45%) with one line under it, "Show the News Hub to choose its categories.", which each switch names as its description. Absent when the API does not list the News Hub (the member cannot use it). If the News Category read fails, the block keeps its line and says so in one dim line. News inks are the News Hub's colour role and appear on this page only here.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
