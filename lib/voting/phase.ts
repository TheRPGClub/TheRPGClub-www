import type { VotingRound } from "@/lib/api/types";

// The voting page's clock for the round's phase: the big figure, what it
// counts and how the window ends.
export interface PhaseClock {
  figure: string;
  label: string;
  detail: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// The club schedules rounds in US Eastern (see Voting::Schedule), so render the
// window boundaries in that zone rather than the server's.
function formatEt(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")}, ${get("month")} ${get("day")} · ${get("hour")}:${get("minute")} ${get("dayPeriod")} ET`;
}

function daysUntil(iso: string, now: number): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / DAY_MS));
}

// The whole phase in one place: the page title names what the round is
// doing, and the clock says how long it has left or how it ended.
export function phaseCopy(
  round: VotingRound,
  now: number,
): { title: string; clock: PhaseClock } {
  const n = round.round_number;
  switch (round.phase) {
    case "nominating": {
      const days = daysUntil(round.voting_opens_at, now);
      return {
        title: "Nominations",
        clock: {
          figure: String(days),
          label: `${days === 1 ? "Day" : "Days"} of nominations left`,
          detail: `Voting opens ${formatEt(round.voting_opens_at)}`,
        },
      };
    }
    case "voting": {
      const days = daysUntil(round.voting_closes_at, now);
      return {
        title: "Voting",
        clock: {
          figure: String(days),
          label: `${days === 1 ? "Day" : "Days"} of voting left`,
          detail: `Voting closes ${formatEt(round.voting_closes_at)}. Nominations are closed.`,
        },
      };
    }
    case "runoff":
      return {
        title: "Results",
        clock: {
          figure: "Runoff",
          label: "Voting ended in a tie",
          detail: round.runoff_closes_at
            ? `A runoff between the tied games closes ${formatEt(round.runoff_closes_at)}.`
            : "A runoff between the tied games decides the winner.",
        },
      };
    case "tie":
      return {
        title: "Results",
        clock: {
          figure: "Tie",
          label: "Voting ended in a tie",
          detail: `The admins will pick Round ${n}'s winner, then nominations open for the next round.`,
        },
      };
    case "closed":
    case "decided":
      return {
        title: "Results",
        clock: {
          figure: "Closed",
          label: "Voting has ended",
          detail: `Nominations for the next round open once Round ${n}'s winners are recorded.`,
        },
      };
  }
}
