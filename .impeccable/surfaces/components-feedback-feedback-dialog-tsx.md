---
version: 1
slug: "components-feedback-feedback-dialog-tsx"
primary_target: "components/feedback/feedback-dialog.tsx"
related_targets: ["app/(protected)/feedback/page.tsx"]
---

# Give feedback dialog (on /feedback)

Mode: Operate. A member files new Feedback, or edits their own Pending Feedback, without leaving the Feedback Board. Glossary terms only in copy.

## Direction contract

THESIS: The form is the board's card, inked by its kind: choosing a kind recolours the whole card, never a long grey stacked form on its own page.
OWN-WORLD: Monthly Issue ink ground, Anton and Barlow. The chosen kind's ink (Feature Request sky #8ec5ff, Suggestion wheat #d4c48a, Bug Report coral #ff9b85) fills the card's header and tints every field stroke, label and choice; highlighter yellow stays for focus and the primary button.
STORY: From the board, "Give feedback" (or Edit on their own Pending card) opens the dialog over the wall; the member picks a kind, fills its fields, posts, and lands back on the board with their card pinned.
FIRST VIEWPORT: A dialog (max ~760px, card corners, deep shadow) over the dimmed board. Header filled in the kind's ink with ink type: the kind's big lucide icon, the kind name in Anton, its one-line description; on its right a three-way switch (Feature Request / Suggestion / Bug Report, each icon + name) — switching recolours header, labels, strokes and choices and swaps the icon. No Pending/status strip and no staff-review note. Below, the fields straightened into one aligned column: Title; Bug Report adds Where (two choices filled in the ink when chosen), What happened, What you expected, Steps (optional), Screenshot drop zone (dashed ink at 50%, bug watermark). Footer: Cancel (ghost) and "Post to the board" (highlight). Edit mode: same dialog, title "Edit", button "Save".
FORM: locked sketch "card-inked" (iteration of "Write on the card", 2 rounds), .impeccable/mocks/decision/fb/card-inked.html, plus the owner's steer above. seed:ad9c4586701fd631
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
