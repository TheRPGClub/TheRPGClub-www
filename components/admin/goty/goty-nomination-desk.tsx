"use client";

import { useRef, useState } from "react";
import { removeGotyNominationAction } from "@/app/actions/goty-desk";
import type { GotyNomination, GotyVote } from "@/lib/api/goty";
import { nominationsRemovable } from "@/lib/goty-desk";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { GotyNominationEntry } from "./goty-nomination-entry";
import { DeletedGotyNominationProof, type DeletedGotyNomination } from "./goty-nomination-notice";
import { GotyReasonBox } from "./goty-reason-box";

// The year's Game of the Year nominations, as the GOTM nomination desk
// files them: game and nominator, oldest first. Remove opens the reason
// box; the removal waits out the Undo bar, then the entry turns into the
// proof of the bot's announcement. Staff remove until voting opens.
export function GotyNominationDesk({
  vote,
  nominations,
  viewerId,
  viewerName,
  now,
}: {
  vote: GotyVote;
  nominations: GotyNomination[];
  viewerId: string;
  viewerName: string;
  now: number;
}) {
  const removable = nominationsRemovable(vote, now);
  const [asking, setAsking] = useState<number | null>(null);
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [deleted, setDeleted] = useState<Record<number, DeletedGotyNomination>>({});
  const held = useRef(new Map<number, { nomination: GotyNomination; reason: string }>());

  const undo = useUndoDelete<number>({
    commit: async (id) => {
      const item = held.current.get(id);
      held.current.delete(id);
      if (!item) return;
      const own = item.nomination.user_id === viewerId;
      const result = await removeGotyNominationAction(vote.year, id, item.nomination.user_id, item.reason);
      if (!result.ok) return { error: result.error ?? "Couldn't remove it." };
      setDeleted((prev) => ({ ...prev, [id]: { ...item, own, jobId: result.jobId ?? null } }));
    },
  });

  const live = new Map(nominations.map((n) => [n.id, n]));
  for (const d of Object.values(deleted)) live.set(d.nomination.id, d.nomination);
  const entries = [...live.values()].sort((a, b) => a.nominated_at.localeCompare(b.nominated_at) || a.id - b.id);
  const count = entries.filter((n) => !deleted[n.id]).length;

  return (
    <section aria-labelledby="goty-noms" className="min-w-0">
      <h2
        id="goty-noms"
        className="font-headline flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b-2 border-foreground pb-1 text-[2.6rem] leading-[0.85] sm:text-[3rem]"
      >
        Game of the Year
        <span className="font-label text-[0.85rem] font-bold tracking-[0.08em] text-faint-foreground">
          {count} {count === 1 ? "nomination" : "nominations"}
        </span>
      </h2>
      {!removable && (
        <p className="mt-3 text-[0.9rem] text-dim-foreground">
          Voting has opened, so the nominations are in and can no longer be removed.
        </p>
      )}
      {entries.length === 0 ? (
        <p className="mt-3 text-dim-foreground">No Game of the Year nominations for {vote.year}{removable ? " yet" : ""}.</p>
      ) : (
        <ul>
          {entries.map((n) => {
            const own = n.user_id === viewerId;
            const done = deleted[n.id];
            if (done) {
              return (
                <li key={n.id} className="border-b border-border py-3">
                  <DeletedGotyNominationProof deleted={done} vote={vote} viewerName={viewerName} />
                </li>
              );
            }
            if (asking === n.id) {
              return (
                <li key={n.id} className="-mx-3 my-1.5 rounded-md bg-card p-3 ring-1 ring-highlight ring-inset">
                  <GotyReasonBox
                    vote={vote}
                    nomination={n}
                    own={own}
                    viewerName={viewerName}
                    reason={reasons[n.id] ?? ""}
                    onReason={(text) => setReasons((prev) => ({ ...prev, [n.id]: text }))}
                    onConfirm={() => {
                      held.current.set(n.id, { nomination: n, reason: (reasons[n.id] ?? "").trim() });
                      setAsking(null);
                      undo.hold(n.id);
                    }}
                    onCancel={() => setAsking(null)}
                  />
                </li>
              );
            }
            return (
              <GotyNominationEntry
                key={n.id}
                nomination={n}
                own={own}
                removable={removable}
                held={undo.held.has(n.id)}
                error={undo.errors.get(n.id)}
                delayMs={undo.delayMs}
                onDelete={() => setAsking(n.id)}
                onUndo={() => undo.undo(n.id)}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
