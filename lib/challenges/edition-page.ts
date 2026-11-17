import { fetchBacklogCount, fetchEditions, fetchSantaView } from "@/lib/api/challenge-editions";
import type { IsoDay } from "@/lib/challenges/dates";
import { pickEdition, picksClosed, yourPart, type YourPart } from "@/lib/challenges/edition";
import { SECRET_SANTA_CALENDAR, type EditionCalendar } from "@/lib/challenges/edition-calendar";
import type { Challenge, ChallengeEdition, SantaView } from "@/lib/challenges/types";

// An Assignment Challenge's Edition page data (server only): its Editions
// (for the switcher), the one shown, the viewer's place in it, their backlog
// size while sign-up is open, and, while they are a Santa, who they pick for.

export interface EditionPage {
  editions: ChallengeEdition[];
  // Null when the Editions couldn't be read, or none has opened yet.
  edition: ChallengeEdition | null;
  // The newest Edition when another is shown ("Go to Edition 2027").
  newer: ChallengeEdition | null;
  read: boolean;
  part: YourPart;
  backlogCount: number | null;
  santa: SantaView | null;
  calendar: EditionCalendar;
  viewerId: string;
  today: IsoDay;
}

export async function loadEditionPage(
  challenge: Challenge,
  requested: number | null,
  viewerId: string,
  today: IsoDay,
): Promise<EditionPage> {
  const editions = await fetchEditions(challenge.id);
  const edition = pickEdition(editions ?? [], requested, today);
  const part = edition ? yourPart(edition, viewerId) : "out";
  const wantsBacklog = edition?.phase === "signup" && part === "out";
  const wantsSanta = edition?.phase === "picking" && part === "drawn" && !picksClosed(edition, today);
  const [backlogCount, santa] = await Promise.all([
    wantsBacklog ? fetchBacklogCount(viewerId) : Promise.resolve(null),
    wantsSanta && edition ? fetchSantaView(edition.id) : Promise.resolve(null),
  ]);
  const newest = editions?.[0] ?? null;
  const a = challenge.assignment;
  return {
    editions: editions ?? [],
    edition,
    newer: newest && edition && newest.id !== edition.id && newest.year > edition.year ? newest : null,
    read: editions !== null,
    part,
    backlogCount,
    santa,
    calendar: a ? { cutoff: a.signup_cutoff, deadline: a.pick_deadline, reveal: a.reveal } : SECRET_SANTA_CALENDAR,
    viewerId,
    today,
  };
}
