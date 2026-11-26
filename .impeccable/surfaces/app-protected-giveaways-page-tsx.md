---
version: 1
slug: "app-protected-giveaways-page-tsx"
primary_target: "app/(protected)/giveaways/page.tsx"
related_targets: ["app/(protected)/giveaways/claimed/page.tsx","app/(protected)/giveaways/donate/page.tsx","components/giveaways"]
---

# Giveaways (shelf, claimed keys, donate)

Scope: /giveaways (Experience: the prizes lead), /giveaways/claimed and /giveaways/donate (Operate). One family across the three: donated keys are wrapped gifts.
Audience: signed-in club members. Jobs: see what's up for grabs and claim (Members role); get back to a claimed key (reveal, copy, redeem); donate a key and manage donations (take back while unclaimed).
Picked over two mock rounds (2026-11-26, .impeccable/mocks/decision/gv3/): shelf = Wrapped Wall + Prize Counter's foot strip; claimed = Envelope Stack in wrapping paper; donate = Pack the Parcel with owner edits (no ship-to/barcode, From top right, key visible to the donor, button "Donate", "Your donations"). Owner: wrap the whole cover everywhere (ribbon + bow across the full cover), never a small window.

## Direction contract
THESIS: every donated key is a wrapped gift: the game's whole cover tied in its platform's ribbon. Refuses the ledger (rows, tables, side-rail lists) the old pages were.
OWN-WORLD: Monthly Issue ink ground, Anton/Barlow Condensed. Platform inks are the ribbons and the striped gift paper (Steam #66c0f4, GOG #e8d9b0, Epic #f4f4f0, PlayStation #4677e6, Xbox #5fd08a, Switch #ff4fa3, Other #b9b9b2) with ink type. Paper (foreground) is the label and the letter. Yellow only for Claim / Donate.
STORY: shelf: browse wrapped covers by platform, claim one, it unwraps into the letter; the foot counter keeps your keys and donations in reach. Claimed: your envelopes stacked, pick one, read the letter with the key. Donate: pick a game, the cover wraps live in the ribbon, fill the label, Donate; your donations wrapped below until claimed (ribbon cut).
FIRST VIEWPORT: shelf: Giveaways title + count on the paper rule, gift-paper platform tabs, a grid of ~11.5rem wrapped covers with name, donor, age and a torn-edge yellow Claim; a counter strip pinned at the foot from md. Claimed: envelope stack left (~26rem), the open letter right at large scale. Donate: the wrapped cover left (~24rem), the paper label form right with From <name> top right.
FORM: Wrapped Wall (dealt structure 2 of the shelf hand, seed:c93e2ceb36b59907); Envelope Stack (dealt 2, seed:90b894de5f49e69f); Pack the Parcel (round-2 dealt, seed:afa483070b979452).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
