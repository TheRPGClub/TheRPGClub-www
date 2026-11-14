import type { Nomination, VotingCategory } from "@/lib/api/types";
import { TRACK_NAME } from "@/lib/rounds";
import type { useUndoDelete } from "@/hooks/use-undo-delete";
import { NominationEntry } from "./nomination-entry";
import { DeletedNominationProof, type DeletedNomination } from "./nomination-notice";
import { NominationReasonBox } from "./nomination-reason-box";

export interface NominationTrack {
  category: VotingCategory;
  nominations: Nomination[];
}

export const nominationKey = (category: VotingCategory, n: Nomination) => `${category}:${n.user_id}`;

// What the desk hands each track: the round, the viewer, which entry has its
// reason box open, the reasons typed, the deletes sent and the held ones.
export interface NominationDeskState {
  round: number;
  viewerId: string;
  viewerName: string;
  votesCast: boolean;
  asking: string | null;
  reasons: Record<string, string>;
  deleted: Record<string, DeletedNomination>;
  undo: ReturnType<typeof useUndoDelete<string>>;
  ask: (key: string | null) => void;
  setReason: (key: string, text: string) => void;
  confirm: (category: VotingCategory, n: Nomination) => void;
}

// One track's nominations under its name and count, oldest first. The
// deleted entries stay in place as their proofs after the list re-reads
// without them.
export function NominationTrackSection({ track, desk }: { track: NominationTrack; desk: NominationDeskState }) {
  const { category } = track;
  const { round, deleted } = desk;
  const live = new Map(track.nominations.map((n) => [nominationKey(category, n), n]));
  for (const d of Object.values(deleted)) {
    if (d.category === category) live.set(nominationKey(category, d.nomination), d.nomination);
  }
  const entries = [...live.values()].sort((a, b) => a.nominated_at.localeCompare(b.nominated_at));
  const count = entries.filter((n) => !deleted[nominationKey(category, n)]).length;

  return (
    <section aria-labelledby={`noms-${category}`} className="mb-8">
      <h2
        id={`noms-${category}`}
        className="font-headline flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-1 text-[3rem] leading-[0.85]"
      >
        {TRACK_NAME[category]}
        <span className="font-label text-[0.85rem] font-bold tracking-[0.08em] text-faint-foreground">
          {count} {count === 1 ? "nomination" : "nominations"}
        </span>
      </h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-dim-foreground">No {TRACK_NAME[category]} nominations for round {round}.</p>
      ) : (
        <ul>
          {entries.map((n) => {
            const key = nominationKey(category, n);
            const done = deleted[key];
            const own = n.user_id === desk.viewerId;
            if (done) {
              return (
                <li key={key} className="border-b border-border py-3">
                  <DeletedNominationProof deleted={done} round={round} viewerName={desk.viewerName} />
                </li>
              );
            }
            if (desk.asking === key) {
              return (
                <li key={key} className="-mx-3 my-1.5 rounded-md bg-card p-3 ring-1 ring-highlight ring-inset">
                  <NominationReasonBox
                    category={category}
                    nomination={n}
                    round={round}
                    own={own}
                    viewerName={desk.viewerName}
                    votesCast={desk.votesCast}
                    reason={desk.reasons[key] ?? ""}
                    onReason={(text) => desk.setReason(key, text)}
                    onConfirm={() => desk.confirm(category, n)}
                    onCancel={() => desk.ask(null)}
                  />
                </li>
              );
            }
            return (
              <NominationEntry
                key={key}
                nomination={n}
                own={own}
                held={desk.undo.held.has(key)}
                error={desk.undo.errors.get(key)}
                delayMs={desk.undo.delayMs}
                onDelete={() => desk.ask(key)}
                onUndo={() => desk.undo.undo(key)}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
