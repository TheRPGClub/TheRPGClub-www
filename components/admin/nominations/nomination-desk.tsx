"use client";

import { useRef, useState } from "react";
import { staffDeleteNominationAction } from "@/app/actions/nominations";
import type { Nomination, VotingCategory } from "@/lib/api/types";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import type { DeletedNomination } from "./nomination-notice";
import { nominationKey, NominationTrackSection, type NominationDeskState, type NominationTrack } from "./nomination-track";

export type { NominationTrack } from "./nomination-track";

// The round's nominations by track, filed like the dictionary: each entry's
// game, who nominated it and why. Delete opens the reason box; the delete
// then waits out the Undo bar, and once sent the entry turns into the proof
// of the bot's announcement, stamped with its job.
export function NominationDesk({
  round,
  tracks,
  viewerId,
  viewerName,
  votesCast,
}: {
  round: number;
  tracks: NominationTrack[];
  viewerId: string;
  viewerName: string;
  // Voting has opened: a delete takes the votes on it too.
  votesCast: boolean;
}) {
  const [asking, setAsking] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [deleted, setDeleted] = useState<Record<string, DeletedNomination>>({});
  // The entry as it was when its delete was held, so the delete still goes
  // out if the list re-reads meanwhile.
  const held = useRef(new Map<string, { category: VotingCategory; nomination: Nomination; reason: string }>());

  const undo = useUndoDelete<string>({
    commit: async (key) => {
      const item = held.current.get(key);
      held.current.delete(key);
      if (!item) return;
      const own = item.nomination.user_id === viewerId;
      const result = await staffDeleteNominationAction(item.category, round, item.nomination.user_id, item.reason);
      if (!result.ok) return { error: result.error ?? "Couldn't delete it." };
      setDeleted((prev) => ({ ...prev, [key]: { ...item, own, jobId: result.jobId ?? null } }));
    },
  });

  const confirm = (category: VotingCategory, n: Nomination) => {
    const key = nominationKey(category, n);
    held.current.set(key, { category, nomination: n, reason: (reasons[key] ?? "").trim() });
    setAsking(null);
    undo.hold(key);
  };

  const desk: NominationDeskState = {
    round,
    viewerId,
    viewerName,
    votesCast,
    asking,
    reasons,
    deleted,
    undo,
    ask: setAsking,
    setReason: (key: string, text: string) => setReasons((prev) => ({ ...prev, [key]: text })),
    confirm,
  };

  return (
    <div className="mt-6 gap-x-11 md:grid md:grid-cols-2">
      {tracks.map((track) => (
        <NominationTrackSection key={track.category} track={track} desk={desk} />
      ))}
    </div>
  );
}
