import { daysBetween, formatDay, type IsoDay } from "@/lib/challenges/dates";
import { editionCounts, leftOutLine, picksClosed } from "@/lib/challenges/edition";
import { BACKLOG_MINIMUM, formatWeekday } from "@/lib/challenges/edition-calendar";
import type { ChallengeEdition } from "@/lib/challenges/types";

// The Edition side panel's words by phase (surface brief
// challenges-assignment): a label line with the date that matters next, a
// monumental numeral and its caption, and muted lines of context. The
// viewer's own business (the yellow panel) is the component's. Pure.

export interface PanelFacts {
  label: string;
  big: number | null;
  caption: string | null;
  lines: string[];
}

export function panelFacts(edition: ChallengeEdition, today: IsoDay): PanelFacts {
  const counts = editionCounts(edition);
  const until = (day: IsoDay) => Math.max(daysBetween(today, day), 0);
  const day = (d: IsoDay) => formatWeekday(d, today);
  const leftOut = leftOutLine(edition);
  const withLeftOut = (lines: string[]) => (leftOut ? [...lines, leftOut] : lines);
  switch (edition.phase) {
    case "signup":
      if (!edition.signup_open) {
        return {
          label: "Sign-up closed",
          big: null,
          caption: null,
          lines: [`${edition.signed_up_count} signed up. The draw happens today.`],
        };
      }
      return {
        label: `Sign-up closes ${day(edition.signup_cutoff_on)}`,
        big: until(edition.signup_cutoff_on),
        caption: until(edition.signup_cutoff_on) === 1 ? "day to sign up" : "days to sign up",
        lines: [
          `${edition.signed_up_count} signed up so far. You need at least ${BACKLOG_MINIMUM} games in your backlog, now and at the draw.`,
        ],
      };
    case "picking": {
      if (picksClosed(edition, today)) {
        const days = until(edition.reveal_on);
        return {
          label: `Revealed ${day(edition.reveal_on)}`,
          big: days,
          caption: days === 1 ? "day to the reveal" : "days to the reveal",
          lines: withLeftOut([`Every pick is in. The games are revealed on ${formatDay(edition.reveal_on, today)}.`]),
        };
      }
      const days = until(edition.pick_deadline_on);
      const picked = counts.picked !== null ? `, ${counts.picked} picked` : "";
      return {
        label: `Picks due ${day(edition.pick_deadline_on)}`,
        big: days,
        caption: days === 1 ? "day to pick" : "days to pick",
        lines: withLeftOut([`${counts.drawn} in the draw${picked}.`]),
      };
    }
    case "revealed":
      return {
        label: `Revealed ${day(edition.reveal_on)}`,
        big: counts.finished,
        caption: `Finished · ${counts.inProgress} In Progress`,
        lines: [`Every member has until ${day(edition.ends_on)} to Clear their game. Santas are revealed then.`],
      };
    case "ended":
      return {
        label: `Ended ${day(edition.ends_on)}`,
        big: null,
        caption: `${counts.finished} Finished · ${counts.expired} Expired`,
        lines: [],
      };
    default:
      return {
        label: `Cancelled ${day(edition.signup_cutoff_on)}`,
        big: null,
        caption: null,
        lines: withLeftOut(["Fewer than 2 members could be drawn, so this Edition didn't go ahead."]),
      };
  }
}
