// The Staff desk (/admin): the live notes beside a tool in its tab, read
// from what the page fetched.

import type { BotJob, VotingPhase, VotingRound } from "@/lib/api/types";
import { agoText, latestFailure } from "@/lib/bot-jobs";
import type { StaffSection, StaffSectionKey } from "@/lib/staff";

// A live note beside a tool on the desk, e.g. "Round 143 open", or
// "Failed 1 h ago" in signal orange.
export interface DeskNote {
  text: string;
  tone?: "live" | "bad";
}

export type DeskNotes = Partial<Record<StaffSectionKey, DeskNote>>;

// What the desk read for its notes; null where it couldn't (or the viewer's
// tier doesn't reach it).
export interface DeskReadings {
  round: Pick<VotingRound, "round_number" | "phase"> | null;
  pendingSuggestions: number | null;
  // The bot's current presence.
  nowPlaying: string | null;
  presenceCount: number | null;
  // Upcoming live events, already as the note says it ("3", "20+").
  upcomingLiveEvents: string | null;
  // Bot jobs' first page, newest first.
  jobs: readonly BotJob[];
}

const PHASE_NOTE: Record<VotingPhase, string> = {
  nominating: "nominations",
  voting: "open",
  closed: "closed",
  runoff: "runoff",
  tie: "tie break",
  decided: "decided",
};

// The longest presence the note prints whole.
const PRESENCE_NOTE_MAX = 16;

// The notes for the viewer's tools. A tool whose newest bot job failed says
// so ("Failed 2 h ago") over any other note.
export function deskNotes(sections: readonly StaffSection[], r: DeskReadings, now: Date): DeskNotes {
  const notes: DeskNotes = {};
  if (r.round) {
    notes.voting = { text: `Round ${r.round.round_number} ${PHASE_NOTE[r.round.phase]}`, tone: "live" };
  }
  if (r.pendingSuggestions !== null) notes.suggestions = { text: `${r.pendingSuggestions} pending` };
  if (r.nowPlaying) {
    const p = r.nowPlaying;
    notes.presence = {
      text: p.length > PRESENCE_NOTE_MAX ? `${p.slice(0, PRESENCE_NOTE_MAX - 1).trimEnd()}...` : p,
    };
  }
  if (r.presenceCount !== null) notes["presence-history"] = { text: `${r.presenceCount} set` };
  if (r.upcomingLiveEvents !== null) notes["live-events"] = { text: `${r.upcomingLiveEvents} upcoming` };
  for (const section of sections) {
    const failed = section.jobKinds && latestFailure(r.jobs, section.jobKinds);
    if (failed) {
      notes[section.key] = { text: `Failed ${agoText(failed.finished_at ?? failed.updated_at, now)}`, tone: "bad" };
    }
  }
  return notes;
}

// Upcoming live events among the newest `lookback` read: "20+" when every
// one read is still upcoming.
export function upcomingNote(count: number, lookback: number): string {
  return count >= lookback ? `${lookback}+` : String(count);
}
