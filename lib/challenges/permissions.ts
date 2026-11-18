import type { SessionMembership } from "@/lib/auth-types";
import { isModeratorOrAbove } from "@/lib/staff";
import type { Challenge } from "@/lib/challenges/types";

// Who sees which tools on a Challenge page, mirroring the API's rules (spec
// api#376, notes #377). They only shape the page: the API decides every
// request.

type Viewer = { id: string; membership: SessionMembership | null | undefined };

export function isHost(challenge: Pick<Challenge, "host" | "hosted_by_club">, viewer: Viewer): boolean {
  return !challenge.hosted_by_club && challenge.host?.user_id === viewer.id;
}

// The Host edits their own; Moderators and above edit a club-hosted one.
export function canEditChallenge(challenge: Pick<Challenge, "host" | "hosted_by_club">, viewer: Viewer): boolean {
  return isHost(challenge, viewer) || (challenge.hosted_by_club && isModeratorOrAbove(viewer.membership));
}

// The Host deletes their own while it has no Runs (staff remove any from
// the Staff menu).
export function canHostDelete(
  challenge: Pick<Challenge, "host" | "hosted_by_club" | "run_count">,
  viewer: Viewer,
): boolean {
  return isHost(challenge, viewer) && (challenge.run_count ?? 0) === 0 && !isModeratorOrAbove(viewer.membership);
}
