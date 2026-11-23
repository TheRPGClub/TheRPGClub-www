// The Staff desk's in-tray (/admin, design pick 2026-11-23): a card for each
// thing waiting on staff, as a big numeral with one line and the way in.
// Only cards with something in them show, and only those the viewer's tier
// can act on (the page reads each only for those tiers). Client-safe.

import type { BotJob, LiveEvent, VotingRound } from "@/lib/api/types";
import { agoText, botJobKindLabel } from "@/lib/bot-jobs";
import { CLUB_TIME_ZONE } from "@/lib/public-reminders";

export interface TrayCard {
  key: "round" | "suggestions" | "failed" | "live";
  numeral: string;
  title: string;
  // One line of detail; null when the API doesn't give what it needs.
  line: string | null;
  // The tool's label, and where the card goes. A null href opens Bot jobs
  // on its failed jobs instead of navigating.
  action: string;
  href: string | null;
  // open: the club's open business (yellow); bad: a failure (signal
  // orange); plain: worth a look.
  tone: "open" | "bad" | "plain";
}

export interface TrayReadings {
  round: VotingRound | null;
  // Pending Suggestions: how many, and the rows read (for the oldest).
  pending: { total: number; createdAt: readonly string[] } | null;
  jobs: readonly BotJob[];
  // The newest live events read; null when the list couldn't be read.
  events: readonly Pick<LiveEvent, "starts_at" | "ends_at">[] | null;
}

// A failure older than this has had its look; it stays on Bot jobs only.
export const FAILED_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const day = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: CLUB_TIME_ZONE, weekday: "short", day: "numeric", month: "short" })
    .format(new Date(iso))
    .replace(",", "");
// "Tue 24 Nov, 20:00 EST", in the club's zone, named.
function dayTime(iso: string): string {
  const at = new Date(iso);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: CLUB_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: CLUB_TIME_ZONE, timeZoneName: "short" })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;
  return `${day(iso)}, ${time}${zone ? ` ${zone}` : ""}`;
}

function roundCard(r: VotingRound): TrayCard | null {
  const base = { key: "round" as const, numeral: String(r.round_number), action: "Voting console", href: "/admin/voting", tone: "open" as const };
  const at = (iso: string | null | undefined, words: string) => (iso ? `Round ${r.round_number} · ${words} ${day(iso)}` : `Round ${r.round_number}`);
  switch (r.phase) {
    case "nominating":
      return { ...base, title: "Nominations are open", line: at(r.voting_opens_at, "voting opens") };
    case "voting":
      return { ...base, title: "Voting is open", line: at(r.voting_closes_at, "closes") };
    case "runoff":
      return { ...base, title: "Runoff is open", line: at(r.runoff_closes_at, "closes") };
    case "tie":
      return { ...base, title: "A tie to break", line: `Round ${r.round_number}` };
    default:
      return null;
  }
}

export function trayCards(t: TrayReadings, now: Date): TrayCard[] {
  const cards: TrayCard[] = [];
  const round = t.round && roundCard(t.round);
  if (round) cards.push(round);
  if (t.pending && t.pending.total > 0) {
    // The oldest is only known when every pending row was read.
    const all = t.pending.createdAt.length >= t.pending.total;
    const oldest = all ? [...t.pending.createdAt].sort()[0] : undefined;
    cards.push({
      key: "suggestions",
      numeral: String(t.pending.total),
      title: t.pending.total === 1 ? "Suggestion pending" : "Suggestions pending",
      line: oldest ? `Oldest from ${day(oldest)}` : null,
      action: "Review Suggestions",
      href: "/admin/suggestions",
      tone: "plain",
    });
  }
  const failed = t.jobs.filter(
    (j) => j.status === "failed" && now.getTime() - Date.parse(j.finished_at ?? j.updated_at) < FAILED_WINDOW_MS,
  );
  if (failed.length) {
    const last = failed[0];
    cards.push({
      key: "failed",
      numeral: String(failed.length),
      title: failed.length === 1 ? "Bot job failed" : "Bot jobs failed",
      line: `${botJobKindLabel(last.kind)} · ${agoText(last.finished_at ?? last.updated_at, now)}`,
      action: "See bot jobs",
      href: null,
      tone: "bad",
    });
  }
  const upcoming = (t.events ?? []).filter((e) => Date.parse(e.ends_at) > now.getTime());
  if (upcoming.length) {
    const next = [...upcoming].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
    cards.push({
      key: "live",
      numeral: String(upcoming.length),
      title: upcoming.length === 1 ? "Live event coming" : "Live events coming",
      line: Date.parse(next.starts_at) <= now.getTime() ? "One is on now" : `Next: ${dayTime(next.starts_at)}`,
      action: "Live events",
      href: "/admin/live-events",
      tone: "plain",
    });
  }
  return cards;
}
