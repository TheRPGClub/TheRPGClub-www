import type { GotyEligibility } from "./types";
import { releaseLabel } from "./dates";

// /goty's words for the API's answers: an eligibility check in the search,
// and a refused nomination or vote.

export interface EligibilityNote {
  ok: boolean;
  text: string;
}

export function eligibilityNote(e: GotyEligibility): EligibilityNote {
  const when = e.released_on ? releaseLabel(e.released_on, e.date_precision) : null;
  if (e.eligible) return { ok: true, text: when ? `Released ${when}` : `Released in ${e.year}` };
  if (e.reason === "release_unknown") {
    return { ok: false, text: "No known release. Ask staff to record its release, then try again." };
  }
  return {
    ok: false,
    text: `${when ? `First released ${when}. ` : ""}Only games first released in ${e.year} can be nominated.`,
  };
}

const ERRORS: Record<string, string> = {
  nominations_closed: "Nominations are closed.",
  nomination_cap_reached: "You already have three nominations. Withdraw one to nominate another.",
  release_unknown: "No known release for that game. Ask staff to record its release, then try again.",
  voting_closed: "Voting is closed.",
  uncontested: "That Award is uncontested: there is nothing to vote on.",
  not_a_candidate: "That game is not on this Award's ballot.",
  not_in_runoff: "Only the tied games are in the runoff.",
};

// The member-facing sentence for an API error body ({ error, message }).
export function gotyError(body: { error?: string; message?: string } | null, status: number, year?: number): string {
  const code = body?.error ?? "";
  if (code === "not_released_in_year") {
    return `Only games first released in ${year ?? "the year"} can be nominated.`;
  }
  return ERRORS[code] ?? body?.message ?? `Request failed (HTTP ${status}).`;
}
