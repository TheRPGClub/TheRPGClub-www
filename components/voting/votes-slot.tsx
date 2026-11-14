import type { Nomination } from "@/lib/api/types";
import type { TrackData } from "@/lib/voting/load-round";
import { voteTitle } from "@/lib/voting/result";
import { SlotNote } from "./slot-note";

// While voting: how many of the cap the viewer has cast, on what, and their
// own nomination on the ballot. Refreshes with the page after each vote.
export function VotesSlot({
  track,
  own,
  signedIn,
}: {
  track: TrackData;
  own: Nomination | null;
  signedIn: boolean;
}) {
  if (!signedIn) return <SlotNote>Sign in to vote.</SlotNote>;
  const { cap } = track.tally;

  return (
    <div className="flex flex-1 flex-col gap-2">
      <p className="flex items-baseline gap-2">
        <span className="font-headline text-[2.6rem] leading-[0.85]">
          {track.userVotes.length}
          <span className="text-highlight-muted-foreground"> / {cap}</span>
        </span>
        <span className="font-label text-[0.85rem] font-extrabold tracking-[0.08em]">
          votes cast
        </span>
      </p>
      {track.userVotes.length > 0 ? (
        <ul className="space-y-0.5">
          {track.userVotes.map((vote) => (
            <li
              key={vote.vote_id}
              className="font-label truncate text-[0.95rem] font-extrabold tracking-[0.02em]"
            >
              {voteTitle(vote, track.nominations)}
            </li>
          ))}
        </ul>
      ) : (
        <SlotNote>
          {track.nominations.length > 0
            ? "Pick up to " + cap + " games on the board below."
            : "Nothing on this ballot."}
        </SlotNote>
      )}
      {own && (
        <p className="mt-auto text-[0.82rem] font-medium text-highlight-muted-foreground">
          Your nomination: {own.game?.title ?? "Unknown game"}
        </p>
      )}
    </div>
  );
}
