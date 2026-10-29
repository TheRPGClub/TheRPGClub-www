# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, server components), Tailwind CSS v4, shadcn/base-ui primitives, lucide icons. Data comes from the club's Rails API (`API_URL`); sign-in is Discord OAuth.

## What it is

The RPG Club is a Discord community built around playing and discussing games together, RPGs first. This site is the club's web hub. It is the companion to the Discord server and brings the GameDB bot's features to the browser.

- **GameDB** is the club's shared game catalogue, backed by IGDB metadata such as covers, key art, platforms, genres and release dates.
- **Game of the Month.** Each month members nominate and vote on a Game of the Month (GOTM, the main RPG track) and a Non-RPG Game of the Month (NR-GOTM, the secondary track). The history goes back many rounds and links out to Reddit, the Discord thread and the voting results.
- **Members.** Each member has a profile with socials and Discord roles (admin, moderator, regular, member, newcomer). Profiles track Now Playing, Favorites, Completed, Backlog and Collection, plus reviews with a rating and a facet scorecard.
- **Utilities:** imports from CSV, Steam and Completionator, a random backlog picker with HowLongToBeat times, and completion comparison between two members.

## Users

- **Primary: existing club members.** They sign in with Discord to check the current GOTM, nominate and vote, log what they're playing and finishing, write and read reviews, and browse each other's profiles.
- **Secondary: prospective members.** The logged-out landing page must make the club legible and appealing to someone deciding whether to join the Discord.

## Brand commitments

- The club logo (`public/logo.png`) is ransom-note cut-out letters spelling "The RPG Club", black and white on a red starburst. Its red is pure `#ff0000`; the existing `brand-*` scale is sampled from it.
- GOTM and NR-GOTM are two distinct tracks and must stay visually distinguishable everywhere they appear. Today GOTM is brand red and NR-GOTM is purple.
- Destructive UI must stay distinguishable from the brand red.

## Constraints

- Game imagery is IGDB covers (3:4) and key art (wide). Some games lack one or both, and pages need tasteful fallbacks.
- Every route is behind Discord sign-in except the landing page.
- No invented stats, testimonials or member counts on the landing page. Use only real club data or plain description.

## Open decisions

- Whether the landing page shows live club data (current GOTM, etc.) to logged-out visitors depends on the API allowing unauthenticated reads.
