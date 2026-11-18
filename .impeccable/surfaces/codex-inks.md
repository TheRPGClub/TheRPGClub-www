---
version: 1
slug: "codex-inks"
primary_target: "DESIGN.md"
related_targets: ["app/globals.css","themes/monthly-issue/README.md"]
---

# Proposal: "Club Codex inks" colour group for DESIGN.md

Status: chosen with the owner's picks (2026-11-18, `specs/club-codex/design/picks.md`). Values are read from the gallery's `:root` (`.impeccable/mocks/decision/club-codex/index.html`, "Club Codex additions") and match the bot gallery (`club-codex-bot`). Fold this into DESIGN.md's Colors section, after "Region inks", when the first Club Codex surface is built (www#124), through the theme README and `npm run design:sync`.

## Club Codex inks (Club Codex surfaces only)

The Club Codex has two small ink sets, and each set answers one question. The **part inks** say which part of the Club Codex something belongs to (Club History, Club Lore, Fun Facts). The **History Event Kind inks** say what sort of History Event it is. They live on Club Codex surfaces only: /codex, /codex/history (and its front-page band), /codex/lore and each Lore Entry page, /codex/fun-facts, and the Lore Entry and History Event forms. The bot's posts use the same hexes so a colour means the same thing in Discord and on the site.

### Part inks
| Token | Hex | Name | Where (mock option) |
|---|---|---|---|
| `codex-history` | #eadcb8 | Club History parchment | The Club History door fill on /codex (1C); the toc square of a History Event (1C); the "History Event" label on a See also chip or picker row (5D). |
| `codex-lore` | #52d6a4 | Club Lore jade | The Club Lore door (1C); a Lore Entry page's second headline line, date stamp, drop cap, heading underbar, pull-quote rules and type, end square and the See also band (3D); jade spines, the ink spines' 6px cap and the slide-out's 6px top tab (4D). |
| `codex-fact` | #ff8ad8 | Fun Facts pink | The Fun Facts door (1C); the Daily Fun Fact panel's 4px top rule and its "Daily Fun Fact" heading (1C); the index cards on the wall (4D); the inline add panel's 3px top rule and label, and the "Next Daily Fun Fact" tag (5D). |
| `codex-fact-light` | #ffb3e6 | Fun Facts pale pink | Every third index card on the wall (`nth-child(3n+2)`, 4D), so the wall is not one flat pink. Nowhere else. |

Measured: ink (`background`) type on each fill clears 9.3:1 (pink) to 14.4:1 (parchment); each as type or a mark on `background` clears 9.3:1 or more, on `card` 8.6:1 or more and on `muted` 7.9:1 or more.

Two dark companions for type on the jade band (3D) and on paper photo mounts (3D):
- `codex-lore-deep` #123b2e: the small "Added by" line under a Fun Fact on the jade See also band (6.8:1 on jade).
- `codex-lore-print` #1f5c48: the caption label ("23:12", "Next morning") on a taped photo's paper mount (7.1:1 on paper).

### History Event Kind inks
| Token | Hex | Name |
|---|---|---|
| `kind-founding` | #f59ac0 | Founding rose |
| `kind-staff` | #3fd0c9 | Staff lagoon |
| `kind-platform` | #7cb6ff | Platform sky |
| `kind-rules` | #b7dd5e | Rules lime |
| `kind-milestone` | #eadcb8 | Milestone parchment |

Measured: ink type on each clears 9.4:1 or more; each on `background` 9.4:1 or more, on `card` 8.7:1 or more.

Where (2B, 5D, and bot 4B):
- the 10px round dot before a History Event's date and the Kind name in label type (12.5px Barlow Condensed 700, 0.08em, caps) beside it, both in the Kind ink, on the timeline (2B);
- the Kind filter chips: 26px high, 1.5px inset outline in the Kind ink with Kind-ink type ("Staff 2"); the selected chip fills in its ink with ink type (`chip kind`), and "All 11" fills paper when selected (2B);
- the Kind card on the History Event desk: five 64px tiles, outlined in their ink with ink-coloured caps; the chosen one fills, takes ink type, lifts 4px and tilts -2deg (5D);
- the front page's "2016" numeral, in Founding rose because it is the founding year (2B front page);
- in Discord, the accent of each History Event's container in `/codex history` (bot 4B).

### Rules

**The Part Ink Is the Part Rule.** A part ink means that part of the Club Codex and nothing else. Club History parchment shares its hex with Milestone parchment on purpose: they never meet as different meanings, because the timeline uses Kind inks only and the part inks never appear on it.

**The Kind Ink Is the Kind Rule.** Kind inks appear only where a History Event shows its Kind: the timeline, the History Event desk, the front-page numeral and the bot. A Kind ink is a dot, a label, an outline, a selected chip or a selected tile, never the ground of a card or a chapter.

**The Fill Carries Ink Type Rule.** Every part-ink and Kind-ink fill (door, spine, index card, See also band, selected chip, selected tile) carries `background` ink type, body copy included (the doors set body at ink 82%, the door's small labels at ink 70%). Paper type never sits on these fills. On ink grounds the inks are type, rules and marks.

**What stays as it was.** Yellow is still yours: Add, Save changes, the selected spine's 2px inset ring and its "Yours" tag, the open mention row, focus and the caret. Signal orange is still only Delete. Masthead red is still "you are here" (the running head's slashes, the active nav) and the red underline on See also links in the timeline. No Codex ink borrows red, violet, yellow or orange.

**Neighbours.** Fun Facts pink sits near `news-announcements` and `rarity-ultra`, and Staff lagoon near the Journal member ink "lagoon" and `news-emulation`. They never share a surface, so neither is misread; do not reuse one for the other.

## Tokens to add

`codex-history`, `codex-lore`, `codex-fact`, `codex-fact-light`, `codex-lore-deep`, `codex-lore-print`, `kind-founding`, `kind-staff`, `kind-platform`, `kind-rules`, `kind-milestone`, through the Monthly Issue theme so other Themes can restate them. Read the Kind ink through one helper (for example `kindInk(kind)` in `lib/codex/`), as `newsInk()` does for News Categories, and set a part's ink on a card or page root as `--codex-ink`.
