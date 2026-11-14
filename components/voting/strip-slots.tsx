import type { VotingCategory, VotingRound } from "@/lib/api/types";
import type { TrackData } from "@/lib/voting/load-round";
import type { StripSlot } from "@/components/issue/voting-strip";
import { NominatePanel } from "./nominate-panel";
import { ResultSlot } from "./result-slot";
import { SlotNote } from "./slot-note";
import { VotesSlot } from "./votes-slot";

const TRACK_NAME: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

// The viewer's own business per track on the ballot strip: their nomination
// while nominating, their votes while voting, the result after.
export function stripSlots(
  round: VotingRound,
  tracks: TrackData[],
  viewerId: string | undefined,
): StripSlot[] {
  return tracks.map((track) => {
    const name = TRACK_NAME[track.category];
    const own = viewerId
      ? (track.nominations.find((n) => n.user_id === viewerId) ?? null)
      : null;
    if (round.phase === "nominating") {
      return {
        category: track.category,
        title: `Your ${name} nomination`,
        content: viewerId ? (
          // This branch only renders inside the nomination window.
          <NominatePanel category={track.category} round={round.round_number} open existing={own} />
        ) : (
          <SlotNote>Sign in to nominate.</SlotNote>
        ),
      };
    }
    if (round.voting_open) {
      return {
        category: track.category,
        title: `Your ${name} votes`,
        content: <VotesSlot track={track} own={own} signedIn={!!viewerId} />,
      };
    }
    return {
      category: track.category,
      title: `${name} result`,
      content: <ResultSlot round={round} track={track} />,
    };
  });
}
