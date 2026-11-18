import type { ApiErrorBody } from "@/lib/api/errors";
import type { GameSummary } from "@/lib/api/types";
import { daysBetween, type IsoDay } from "@/lib/challenges/dates";
import { BACKLOG_MINIMUM } from "@/lib/challenges/edition-calendar";
import { memberName } from "@/lib/challenges/runs";
import type { ChallengeEdition, EditionAssignment, EditionMember } from "@/lib/challenges/types";

// An Edition's page as plain data (surface brief challenges-assignment, 4A):
// the viewer's place in it, the banner's numerals, the advent doors by
// phase, the Edition shown by default, and how a refused sign-up or
// withdrawal reads. Pure and client-safe. Who picks for whom is never
// shown before the Edition ends, even when staff are served it.

export type YourPart = "out" | "signed-up" | "drawn" | "left-out" | "withdrawn";

export function yourPart(edition: ChallengeEdition, viewerId: string): YourPart {
  const you = (edition.members ?? []).find((m) => m.user_id === viewerId);
  if (!you) return edition.signed_up ? "signed-up" : "out";
  if (you.left_out) return "left-out";
  if (you.withdrawn) return "withdrawn";
  return edition.phase === "signup" || edition.phase === "cancelled" ? "signed-up" : "drawn";
}

// Picks close at the start of the pick deadline day; the API marks it when
// the random picks are made.
export function picksClosed(edition: ChallengeEdition, today: IsoDay): boolean {
  return !!edition.picks_closed_at || today >= edition.pick_deadline_on;
}

const drawnMembers = (edition: ChallengeEdition) => (edition.members ?? []).filter((m) => !m.left_out);

export function editionCounts(edition: ChallengeEdition) {
  const assignments = edition.assignments ?? [];
  const status = (s: string) => assignments.filter((a) => a.run?.status === s).length;
  return {
    drawn: drawnMembers(edition).length,
    // Served to everyone while Santas pick; else known only once the picks
    // can be read (staff from the draw, everyone from the reveal).
    picked: edition.picked_count ?? (edition.assignments ? assignments.filter((a) => a.game).length : null),
    finished: status("finished"),
    inProgress: assignments.filter((a) => a.run?.status === "active" && (a.run.progress.in_progress ?? 0) > 0)
      .length,
    expired: status("expired"),
  };
}

export interface BannerNumeral {
  value: number;
  label: string;
  hi?: boolean;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export function editionNumerals(edition: ChallengeEdition, today: IsoDay): BannerNumeral[] {
  const counts = editionCounts(edition);
  const until = (day: IsoDay) => Math.max(daysBetween(today, day), 0);
  switch (edition.phase) {
    case "signup": {
      const days = until(edition.signup_cutoff_on);
      return [
        { value: days, label: plural(days, "Day to sign up", "Days to sign up"), hi: true },
        { value: edition.signed_up_count, label: "Signed up" },
      ];
    }
    case "picking": {
      const closed = picksClosed(edition, today);
      const days = until(closed ? edition.reveal_on : edition.pick_deadline_on);
      const label = closed
        ? plural(days, "Day to the reveal", "Days to the reveal")
        : plural(days, "Day to pick", "Days to pick");
      const second =
        counts.picked !== null
          ? { value: counts.picked, label: "Picked" }
          : closed
            ? { value: counts.drawn, label: "Picked" }
            : { value: counts.drawn, label: "Drawn" };
      return [{ value: days, label, hi: true }, second];
    }
    case "revealed":
      return [
        { value: counts.finished, label: "Finished", hi: true },
        { value: counts.inProgress, label: "In Progress" },
      ];
    case "ended":
      return [
        { value: counts.finished, label: "Finished", hi: true },
        { value: counts.expired, label: "Expired" },
      ];
    default:
      return [{ value: edition.signed_up_count, label: "Signed up" }];
  }
}

export interface Door {
  key: string;
  number: number;
  name: string;
  member: EditionMember | EditionAssignment["recipient"];
  mine: boolean;
  // seat: signed up; drawn/picked/waiting: picking; open: revealed on its
  // game; empty: revealed with no game (nothing eligible in the backlog).
  state: "seat" | "drawn" | "picked" | "waiting" | "open" | "empty";
  caption: string | null;
  game: GameSummary | null;
  tag: { label: string; tone: "finished" | "progress" | "muted" } | null;
  foot: string | null;
}

function runTag(a: EditionAssignment, ended: boolean): Door["tag"] {
  const run = a.run;
  if (!run) return null;
  if (run.status === "finished") return { label: "Finished", tone: "finished" };
  if (run.status === "expired") return { label: "Expired", tone: "muted" };
  if (run.status === "abandoned") return { label: "Abandoned", tone: "muted" };
  if (!ended && (run.progress.in_progress ?? 0) > 0) return { label: "In Progress", tone: "progress" };
  return null;
}

// Who picked, once the Edition ends ("From Lore Keeper"; a random pick
// names its Santa on a second line); before that only a random pick says so
// (the side panel says when Santas are revealed).
function footOf(a: EditionAssignment, ended: boolean): string | null {
  const santa = ended && a.santa ? memberName(a.santa) : null;
  if (a.picked_randomly) return santa ? `Random pick\nSanta: ${santa}` : "Random pick";
  return santa ? `From ${santa}` : null;
}

export function editionDoors(
  edition: ChallengeEdition,
  viewerId: string,
  today: IsoDay,
): { doors: Door[]; yourSeat: boolean } {
  const members = edition.members ?? [];
  const base = (m: Door["member"], i: number) => ({
    key: m.user_id,
    number: i + 1,
    name: memberName(m),
    member: m,
    mine: m.user_id === viewerId,
    game: null,
    tag: null,
    foot: null,
  });
  if (edition.phase === "signup" || edition.phase === "cancelled") {
    return {
      doors: members.map((m, i) => ({ ...base(m, i), state: "seat", caption: null })),
      yourSeat: edition.phase === "signup" && edition.signup_open && !edition.signed_up,
    };
  }
  if (edition.phase === "picking") {
    // The member's own flag (served to everyone), else staff's assignments.
    const picks = new Map((edition.assignments ?? []).map((a) => [a.recipient.user_id, !!a.game]));
    const closed = picksClosed(edition, today);
    const doors = drawnMembers(edition).map((m, i): Door => {
      const known = m.picked ?? picks.get(m.user_id);
      const state = closed || known ? "picked" : known === false ? "waiting" : "drawn";
      // A plain drawn door says nothing more: the picks are secret.
      const caption = { picked: "Picked for", waiting: "Waiting", drawn: null }[state];
      return { ...base(m, i), state, caption: m.withdrawn ? [caption, "Withdrew"].filter(Boolean).join(" · ") : caption };
    });
    return { doors, yourSeat: false };
  }
  const ended = edition.phase === "ended";
  const order = new Map(members.map((m, i) => [m.user_id, i]));
  const sorted = [...(edition.assignments ?? [])].sort(
    (a, b) => (order.get(a.recipient.user_id) ?? 1e9) - (order.get(b.recipient.user_id) ?? 1e9),
  );
  const doors = sorted.map((a, i): Door => ({
    ...base(a.recipient, i),
    state: a.game ? "open" : "empty",
    caption: a.game ? null : "No game: nothing left in their backlog to pick",
    game: a.game ?? null,
    tag: runTag(a, ended),
    foot: a.game ? footOf(a, ended) : null,
  }));
  return { doors, yourSeat: false };
}

// "Couch Co-op was left out: under 5 games in their backlog at the draw."
export function leftOutLine(edition: ChallengeEdition): string | null {
  const out = (edition.members ?? []).filter((m) => m.left_out).map(memberName);
  if (out.length === 0) return null;
  const names = out.length === 1 ? out[0] : `${out.slice(0, -1).join(", ")} and ${out.at(-1)}`;
  return `${names} ${out.length === 1 ? "was" : "were"} left out: under ${BACKLOG_MINIMUM} games in their backlog at the draw.`;
}

// The Edition a page shows: the one asked for, else the newest, except
// while the newest is in a sign-up still more than a month from its draw and
// last year's games are out, when those games are the news.
export function pickEdition(
  editions: readonly ChallengeEdition[],
  requested: number | null,
  today: IsoDay,
): ChallengeEdition | null {
  const asked = editions.find((e) => e.id === requested);
  if (asked) return asked;
  const [newest, previous] = editions;
  if (!newest) return null;
  if (newest.phase === "signup" && previous?.phase === "revealed" && daysBetween(today, newest.signup_cutoff_on) > 30)
    return previous;
  return newest;
}

// Used only when the API sends no message of its own.
const FALLBACK: Record<string, string> = {
  signup_closed: "Sign-up for this Edition has closed.",
  already_signed_up: "You're already signed up for this Edition.",
  not_signed_up: "You aren't signed up for this Edition.",
  picks_closed: "Picks have closed, so you can't leave this Edition now.",
  not_drawn: "The draw left you out, so there's nothing to leave.",
};

// How a refused sign-up or withdrawal reads, from the API's error
// (`backlog_too_small` carries `minimum` and `backlog_count` in its body).
export function editionRefusal(err: ApiErrorBody): string {
  const { status } = err;
  if (status === 401) return "Your session has ended. Sign in again.";
  const b = err.body ?? {};
  if (err.code === "backlog_too_small" && typeof b.minimum === "number" && typeof b.backlog_count === "number") {
    return `You need at least ${b.minimum} games in your backlog to sign up (you have ${b.backlog_count}).`;
  }
  if (err.message) return err.message;
  if (err.code && Object.hasOwn(FALLBACK, err.code)) return FALLBACK[err.code];
  if (status === 403) return "Challenges aren't open to you just now.";
  if (status === 404) return "This Edition no longer exists, or is hidden.";
  return "That didn't work. Try again in a moment.";
}
