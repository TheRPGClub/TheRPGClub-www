import type { IsoDay } from "@/lib/challenges/dates";
import { picksClosed, type YourPart } from "@/lib/challenges/edition";
import { calendarStrip, type StripTile } from "@/lib/challenges/edition-calendar";
import type { EditionPage } from "@/lib/challenges/edition-page";
import { memberName } from "@/lib/challenges/runs";
import type { EditionPhase } from "@/lib/challenges/types";

// Every prop the Edition page hands its client components, built on the
// server from the Edition as served. Whatever a client component receives
// reaches the browser, and staff are served who gives what to whom from the
// draw on, so only plain words and numbers cross: never a Santa, and the
// viewer's own game only from the reveal (lib/challenges/edition-client.test
// guards it). Pure.

// What the viewer's own business in the side panel needs (YourBusiness,
// SignupPanel, LeaveAfterDraw).
export interface YourBusinessProps {
  phase: EditionPhase;
  editionId: number;
  year: number;
  challengeId: number;
  challengeName: string;
  signupOpen: boolean;
  signupCutoffOn: IsoDay;
  pickDeadlineOn: IsoDay;
  revealOn: IsoDay;
  picksClosed: boolean;
  part: YourPart;
  // The viewer's backlog size and whether it meets the sign-up minimum
  // (null from an API that doesn't serve them).
  backlogCount: number | null;
  eligible: boolean | null;
  // The viewer as a Santa: who they pick for and what they picked.
  pickFor: { recipient: string; picked: string | null } | null;
  // The viewer's own game, once revealed (the yellow panel's title).
  yourGame: string | null;
  viewerId: string;
  today: IsoDay;
}

export interface EditionClientProps {
  // The Edition switcher, when there are several.
  switcher: { challengeId: number; current: number; editions: { id: number; year: number }[] } | null;
  strip: StripTile[];
  business: YourBusinessProps;
}

export function editionClientProps(data: EditionPage & { edition: NonNullable<EditionPage["edition"]> }): EditionClientProps {
  const { edition, santa, today, viewerId } = data;
  const revealed = edition.phase === "revealed" || edition.phase === "ended";
  const yours = revealed ? edition.assignments?.find((a) => a.recipient.user_id === viewerId) : undefined;
  return {
    switcher:
      data.editions.length > 1
        ? {
            challengeId: edition.challenge.id,
            current: edition.id,
            editions: data.editions.map((e) => ({ id: e.id, year: e.year })),
          }
        : null,
    strip: calendarStrip(edition, today),
    business: {
      phase: edition.phase,
      editionId: edition.id,
      year: edition.year,
      challengeId: edition.challenge.id,
      challengeName: edition.challenge.name,
      signupOpen: edition.signup_open,
      signupCutoffOn: edition.signup_cutoff_on,
      pickDeadlineOn: edition.pick_deadline_on,
      revealOn: edition.reveal_on,
      picksClosed: picksClosed(edition, today),
      part: data.part,
      backlogCount: edition.viewer?.backlog_count ?? null,
      eligible: edition.viewer?.eligible ?? null,
      pickFor: santa ? { recipient: memberName(santa.recipient), picked: santa.pick?.game.title ?? null } : null,
      yourGame: yours?.game?.title ?? null,
      viewerId,
      today,
    },
  };
}
