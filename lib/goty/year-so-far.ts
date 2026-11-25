import type { GotyAward, GotyAwardKey, GotyClubRelease, GotyVote } from "./types";
import { etDateTime, etDayYear } from "./dates";

// The Year So Far (api#482): what an upcoming GOTY Vote shows before its
// nominations open. The year's GOTM and NR-GOTM winners to date (they become
// those Awards' ballots), and the year's releases members have played,
// which are never nominations. Plus how the vote works, with its real
// dates. Pure, shared by the page and its tests.

// The API sends at most this many club releases.
export const CLUB_RELEASES_MAX = 48;

export function clubReleases(vote: GotyVote): GotyClubRelease[] {
  return vote.club_releases ?? [];
}

const TRACK = { gotm: "GOTM", nr_gotm: "NR-GOTM" } as const;

// The line over an Award's Year So Far.
export function yearSoFarLine(vote: GotyVote, award: GotyAward): string {
  if (award.award === "game_of_the_year") {
    const releases = clubReleases(vote);
    const most = releases.length >= CLUB_RELEASES_MAX ? ` The ${CLUB_RELEASES_MAX} most played are shown.` : "";
    return (
      `Games first released in ${vote.year} that members have completed, are playing or have reviewed, most played first. ` +
      `These are not nominations: Game of the Year nominations open ${etDayYear(vote.nominations_open_at)}, ` +
      `when any game first released in ${vote.year} can be nominated, played or not.${most}`
    );
  }
  const track = TRACK[award.award];
  return `The ${vote.year} ${track} winners so far. They become ${award.name}'s ballot, with every ${track} winner still to come this year. Nobody nominates for it.`;
}

// An Award's Year So Far when it has nothing yet.
export function yearSoFarEmpty(vote: GotyVote, award: GotyAwardKey): string {
  if (award === "game_of_the_year") return "No release from this year played yet.";
  return `No ${vote.year} ${TRACK[award]} round has a winner yet. Each month's winner joins this list.`;
}

export interface HowItWorks {
  awards: { key: GotyAwardKey; name: string; text: string }[];
  dates: { step: string; when: string }[];
  rules: { title: string; text: string }[];
}

// The how-it-works section: the three Awards, the vote's real dates and
// the rules (3 nominations each, the vote cap, runoffs).
export function howItWorks(vote: GotyVote): HowItWorks {
  const y = vote.year;
  const name = (key: GotyAwardKey, fallback: string) => vote.awards.find((a) => a.award === key)?.name ?? fallback;
  const runoff =
    vote.runoff_opens_at && vote.runoff_closes_at
      ? `${etDateTime(vote.runoff_opens_at)} to ${etDateTime(vote.runoff_closes_at)}`
      : `Right after voting closes, for a day`;
  return {
    awards: [
      { key: "gotm", name: name("gotm", "GOTM of the Year"), text: `The best of the year's GOTM winners. Its ballot is every GOTM winner from the ${y} rounds.` },
      { key: "nr_gotm", name: name("nr_gotm", "NR-GOTM of the Year"), text: `The best of the year's NR-GOTM winners. Its ballot is every NR-GOTM winner from the ${y} rounds.` },
      { key: "game_of_the_year", name: name("game_of_the_year", "Game of the Year"), text: `The best game first released in ${y}. Members nominate, then everyone votes on the nominations.` },
    ],
    dates: [
      { step: "Nominations open", when: etDateTime(vote.nominations_open_at) },
      { step: "Voting opens", when: etDateTime(vote.voting_opens_at) },
      { step: "Voting closes", when: etDateTime(vote.voting_closes_at) },
      { step: vote.runoff_opens_at ? "Runoff" : "Runoff, if tied", when: runoff },
    ],
    rules: [
      {
        title: "3 nominations each",
        text: `Each member nominates up to 3 games for Game of the Year, played or not. A game counts by its first release anywhere, so it must be first released in ${y}. GOTM and NR-GOTM of the Year take no nominations.`,
      },
      {
        title: "The vote cap",
        text: "On each Award you can vote for up to half its ballot, rounded down, and at least one. A vote past the cap drops your oldest; voting for a game again takes the vote back. An Award with one candidate goes to it without a vote.",
      },
      {
        title: "Runoffs",
        text: "An Award that ties goes to a runoff of only the tied games, one vote each. If it ties again, an admin decides.",
      },
    ],
  };
}
