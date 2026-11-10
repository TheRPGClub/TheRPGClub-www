---
version: 1
slug: "app-app-settings-page-tsx"
primary_target: "app/(app)/settings/page.tsx"
related_targets: ["components/feature/feature-preferences-form.tsx","components/feature/feature-switch.tsx"]
---

# Surface: /settings (member Feature Preferences)

Mode: Operate. Scope: ordinary extension inside the established DESIGN.md world (www#74, spec api#347).
Audience/job: any signed-in member tidying their own view of the site; Admins and Superadmins also previewing it as members see it.

## Direction contract

THESIS: A settings page is one more department of the magazine: the SETTINGS headline on its paper rule, a FEATURES department, and plain switch rows. It refuses the generic settings template of grouped cards, icons per row and a sticky save bar.

OWN-WORLD: Ink ground, Anton headline and section title on 2px paper rules, Barlow Condensed caps for row names and switch state, Barlow dim for the "where it shows up" line, 1px rule hairlines between rows. The switch is a hard-cornered 44x24 track: highlighter yellow with an ink block when shown (the member's own choice), ink-3 well with a muted block when hidden.

STORY: The member reads one line (hidden parts leave nav, dashboard and other pages; links still work), flips what they don't use, and sees the sidebar follow at once.

FIRST VIEWPORT: SETTINGS headline, FEATURES title, the explanatory line, then one row per Live hideable Feature (name, where it shows up, Shown/Hidden switch on the right), capped at 42rem. Staff: Preview rows carry the highlight Preview chip; a "Show Preview features" switch sits below on a raised ink-2 panel with a Staff chip. No Live hideable Feature: a dashed rule-strong box with one short line replaces the list. No preview column, no Core list (user's changes to the locked pick).

FORM: Locked pick "Switches" (`.impeccable/mocks/decision/settings-preview.html`) minus its preview column and Always shown list; seed: none (no roll: the structure was hand-sketched and locked by the user in the feature-flags decision round, and this build was told to skip option rounds). Signature interaction: save on flip; the block slides 200ms (motion-safe), the label reads Saving while the API answers, and a failed save springs back with the reason under the row.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
