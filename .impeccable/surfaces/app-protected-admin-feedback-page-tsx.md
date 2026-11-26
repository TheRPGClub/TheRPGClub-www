---
version: 1
slug: "app-protected-admin-feedback-page-tsx"
primary_target: "app/(protected)/admin/feedback/page.tsx"
related_targets: ["components/feedback"]
---

# Feedback review desk (/admin/feedback)

Mode: Operate. Superadmins review Pending Feedback: change its kind, approve it into a repo (opens a GitHub issue), reject it with a reason, or mark it a Duplicate. Glossary terms only in copy.

## Direction contract

THESIS: Pending Feedback sorted into three kind lanes, so a misfiled item is obvious at a glance; review happens in a side sheet, never a stacked form under every card.
OWN-WORLD: Monthly Issue ink ground, Anton and Barlow; the board's kind inks (tokens --kind-feature-request / --kind-suggestion / --kind-bug-report) on lane rules and the sheet's inked header; yellow for Approve and focus; signal orange only for Reject's confirm.
STORY: Staff scan three lanes, open a card, and decide in the sheet without losing the queue behind it; the card leaves its lane once decided (or moves lanes when its kind changes).
FIRST VIEWPORT: Back link "Staff desk", title "Feedback review", "N pending". Three equal lanes, each headed by icon + Anton kind name + pending count on a 3px ink rule, compact straight cards (title, author, Anton upvote count), most upvoted first. Opening a card rings it yellow and opens the shadcn Sheet (components/ui/sheet, side right, ~440px; full width on phones): the inked header (kind icon, kind name, three-way kind switch), the Feedback's fields read-only and screenshot, then Tabs Approve / Reject / Duplicate. Approve: repo choice Bot / API / Website (pre-filled from a Bug Report's Where) and "Approve and open issue". Reject: reason, with "Can't reproduce" and "Working as intended" quick picks on Bug Reports, orange "Reject". Duplicate: search the original (Pending, Approved or Done Feedback), "Mark duplicate · N upvotes move there".
FORM: locked sketch "desk-lanes", .impeccable/mocks/decision/fb/desk-lanes.html; owner: build the slide-over with the shadcn Sheet component. seed:9d087cfaee507de6
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
