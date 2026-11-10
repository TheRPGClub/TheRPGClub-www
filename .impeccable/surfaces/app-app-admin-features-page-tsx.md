---
version: 1
slug: "app-app-admin-features-page-tsx"
primary_target: "app/(app)/admin/features/page.tsx"
related_targets: ["components/admin/features/feature-flag-desk.tsx"]
---

# Surface: /admin/features (staff desk, Feature Flags)

Mode: Operate. Scope: a whole surface inside the established Monthly Issue world (DESIGN.md, Production desk). Audience/job: Admins and Superadmins, at a desk or mid-incident, reading every Feature's state at a glance and switching one Off, Preview or Live.

## Direction contract

THESIS: The flag board is a desk department, a printed ledger of the club's Features: two departments (Core, Hideable) of one aligned table, each row a Feature with its reach and a three-ink switch. Refuses the settings-page default of a list of toggles with descriptions.

OWN-WORLD: Ink ground, Anton names and section titles on 2px paper rules, Barlow Condensed tracked caps for column heads, chips and the change line. State inks: Live done green, Preview highlighter yellow, Off masthead red (desk-only exception), as type plus a 2px inset stroke on ink, never fills. Destructive confirm in signal orange.

STORY: Staff see every Feature's state and last change, know what a flag switches (Website, Bot, Posts), flip Preview or Live in one click, and are asked before Off.

FIRST VIEWPORT: DeskHeader "FEATURES" with counts and the "site at once, bot within a minute" note at right; CORE FEATURES with its table (group head "One flag switches all three at once" over the coverage columns), state controls right-aligned in the last column.

FORM: locked decision sketch "flags-grouped" (code-led; user picks in specs design/picks.md); seed:f5ecf4e6ecf4cc13 (dealt option 1, "Core / Hideable departments", from the feature-flags decision round's surface roll; composition locked and amended by the user). Signature interaction: the Off / Preview / Live segmented control that wears the state's ink, with Off arming a dashed red outline while its orange confirm opens under the row; the last-change line slides in once after a save (motion-safe).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions
- User changes to the sketch: no subtitles beside the section titles; state colours as above on the selected segment and the last-change state; real 11 rows (6 Core, 5 Hideable) from GET /api/v1/features.
- Off confirm is a plain confirm (no typed words): Off is reversible with one click.
- A reason is typed before picking a state (speech-bubble button opens the field; the Off confirm carries it too), because the API's change log is read-only after the save.
