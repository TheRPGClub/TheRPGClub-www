import { fetchChallenge } from "@/lib/api/challenges";
import { fetchEditions, readSantaView } from "@/lib/api/challenge-editions";
import { clubToday, type IsoDay } from "@/lib/challenges/dates";
import { pickPageState, santaEdition, type PickPageState } from "@/lib/challenges/santa-pick";
import { challengeTint } from "@/lib/challenges/tint";
import type { Challenge, ChallengeTint, SantaView } from "@/lib/challenges/types";

// A Santa's pick page data (server only, www#111): the Assignment Challenge,
// the Edition (asked for, else the one in picking), and the signed-in
// member's Santa view of it. The API decides who may read it: anyone the
// draw didn't make this Edition's Santa gets its refusal, shown as a slip.

export interface PickPage {
  challenge: Challenge;
  tint: ChallengeTint;
  editionId: number | null;
  view: SantaView | null;
  state: PickPageState;
  today: IsoDay;
}

const UNREAD: PickPageState = {
  kind: "unread",
  title: "Not just now",
  message: "Your pick page couldn't be read. Try again in a moment.",
};

// "not-found" when the Challenge doesn't exist, is hidden, or isn't an
// Assignment Challenge (the route's 404); "unread" when the Challenge
// itself couldn't be read.
export async function loadPickPage(
  challengeId: number,
  requested: number | null,
): Promise<PickPage | "not-found" | "unread"> {
  const read = await fetchChallenge(challengeId);
  if (!read.ok) return read.status === 404 ? "not-found" : "unread";
  const challenge = read.data;
  if (challenge.challenge_format !== "assignment") return "not-found";
  const base = { challenge, tint: challengeTint(challenge), today: clubToday() };
  const editions = await fetchEditions(challenge.id);
  if (editions === null) return { ...base, editionId: null, view: null, state: UNREAD };
  const edition = santaEdition(editions, requested);
  if (!edition) {
    const state: PickPageState = {
      kind: "refused",
      title: "Not your pick",
      message: "This Challenge has no Edition yet, so there's nobody to pick for.",
    };
    return { ...base, editionId: null, view: null, state };
  }
  const santa = await readSantaView(edition.id);
  return { ...base, editionId: edition.id, view: santa.ok ? santa.view : null, state: pickPageState(santa) };
}
