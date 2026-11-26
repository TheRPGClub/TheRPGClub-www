---
version: 1
slug: "app-protected-feedback-page-tsx"
primary_target: "app/(protected)/feedback/page.tsx"
related_targets: ["components/feedback"]
---

# Feedback Board (/feedback)

Mode: Operate. Members scan their club's Feedback for one kind, upvote ("I hit this too" on Bug Reports), withdraw or edit their own Pending Feedback, and give new Feedback. Glossary: Feedback, Feature Request, Suggestion, Bug Report, Duplicate, Feedback Board (api GLOSSARY.md).

## Direction contract

THESIS: Today's pinned wall, straightened and split by kind: one kind at a time behind icon tabs, never a tracker list with status pills.
OWN-WORLD: Monthly Issue ink ground, Anton tabs and numerals, Barlow Condensed labels. Kind inks on Feedback surfaces only: Feature Request sky #8ec5ff, Suggestion wheat #d4c48a, Bug Report coral #ff9b85. Straight cards (card, 6px corners, soft shadow) with a status-ink header band carrying status and the upvote count; taped rejection slip on Rejected/Duplicate.
STORY: A member opens a kind, sees what's approved and coming, what's waiting, then what's done; upvotes; files their own.
FIRST VIEWPORT: Title "Feedback Board" with "Give feedback" (highlight) at right; no count and no rule under the title. One tab row on a single 1px rule: three tabs, each a lucide icon (Sparkles / Wrench / Bug) in its ink, the kind name in Anton, its count; the active tab's 3px ink bar sits on the rule, inactive tabs dim. Below: the kind's one-line description left, Open / Closed segmented control right. Then the whole kind's wall, 3 across, no "See all": Approved first, then Pending, then Done; most upvotes first within each. No kind badge on cards. `?pinned=<id>` opens the pinned item's kind tab and rings it in yellow.
FORM: locked sketch "lines-a" (owner steer from today's wall, 4 rounds), .impeccable/mocks/decision/fb/lines-a.html. seed:572859cba1a49898
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
