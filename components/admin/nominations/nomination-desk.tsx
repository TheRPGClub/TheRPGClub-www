"use client";

import { useId, useRef, useState } from "react";
import { Scissors, Trash2 } from "lucide-react";
import { staffDeleteNominationAction } from "@/app/actions/nominations";
import type { Nomination, VotingCategory } from "@/lib/api/types";
import { UNDO_DELAY_MS } from "@/lib/desk";
import { REMOVAL_REASON_MAX, TRACK_NAME } from "@/lib/rounds";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import { fieldLabel } from "@/components/admin/rounds/styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NominationTrack {
  category: VotingCategory;
  nominations: Nomination[];
}

interface Deleted {
  category: VotingCategory;
  nomination: Nomination;
  reason: string;
  own: boolean;
  jobId: number | null;
}

const keyOf = (category: VotingCategory, n: Nomination) => `${category}:${n.user_id}`;

function nominatorName(n: Nomination): string {
  return n.user?.global_name || n.user?.username || n.user_id;
}

function gameTitle(n: Nomination): string | null {
  return n.game?.title ?? null;
}

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
  const [deleted, setDeleted] = useState<Record<string, Deleted>>({});
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
    const key = keyOf(category, n);
    held.current.set(key, { category, nomination: n, reason: (reasons[key] ?? "").trim() });
    setAsking(null);
    undo.hold(key);
  };

  return (
    <div className="mt-6 gap-x-11 md:grid md:grid-cols-2">
      {tracks.map((track) => {
        // The deleted entries stay in place as their proofs after the
        // list re-reads without them.
        const live = new Map(track.nominations.map((n) => [keyOf(track.category, n), n]));
        for (const d of Object.values(deleted)) {
          if (d.category === track.category) live.set(keyOf(track.category, d.nomination), d.nomination);
        }
        const entries = [...live.values()].sort((a, b) => a.nominated_at.localeCompare(b.nominated_at));
        const count = entries.filter((n) => !deleted[keyOf(track.category, n)]).length;

        return (
          <section key={track.category} aria-labelledby={`noms-${track.category}`} className="mb-8">
            <h2
              id={`noms-${track.category}`}
              className="font-headline flex items-baseline justify-between gap-3 border-b-2 border-paper pb-1 text-[3rem] leading-[0.85]"
            >
              {TRACK_NAME[track.category]}
              <span className="font-label text-[0.85rem] font-bold tracking-[0.08em] text-paper-mute">
                {count} {count === 1 ? "nomination" : "nominations"}
              </span>
            </h2>
            {entries.length === 0 ? (
              <p className="mt-3 text-paper-dim">No {TRACK_NAME[track.category]} nominations for round {round}.</p>
            ) : (
              <ul>
                {entries.map((n) => {
                  const key = keyOf(track.category, n);
                  const done = deleted[key];
                  if (done) {
                    return (
                      <li key={key} className="border-b border-rule py-3">
                        <DeletedProof deleted={done} round={round} viewerName={viewerName} />
                      </li>
                    );
                  }
                  if (asking === key) {
                    return (
                      <li key={key} className="-mx-3 my-1.5 rounded-md bg-ink-2 p-3 ring-1 ring-highlight ring-inset">
                        <ReasonBox
                          category={track.category}
                          nomination={n}
                          round={round}
                          own={n.user_id === viewerId}
                          viewerName={viewerName}
                          votesCast={votesCast}
                          reason={reasons[key] ?? ""}
                          onReason={(text) => setReasons((prev) => ({ ...prev, [key]: text }))}
                          onConfirm={() => confirm(track.category, n)}
                          onCancel={() => setAsking(null)}
                        />
                      </li>
                    );
                  }
                  return (
                    <Entry
                      key={key}
                      nomination={n}
                      own={n.user_id === viewerId}
                      held={undo.held.has(key)}
                      error={undo.errors.get(key)}
                      delayMs={undo.delayMs}
                      onDelete={() => setAsking(key)}
                      onUndo={() => undo.undo(key)}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Entry({
  nomination,
  own,
  held,
  error,
  delayMs,
  onDelete,
  onUndo,
}: {
  nomination: Nomination;
  own: boolean;
  held: boolean;
  error: string | undefined;
  delayMs: number;
  onDelete: () => void;
  onUndo: () => void;
}) {
  const title = gameTitle(nomination) ?? "No game named";
  const struck = held && "text-paper-mute line-through decoration-destructive";
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-rule py-2.5">
      <span className={cn("text-[1.05rem] font-bold break-words", struck)}>{title}</span>
      <span className={cn("col-start-1 text-[0.93rem] break-words text-paper-dim italic", struck)}>
        <b className="font-label mr-1.5 text-[0.72rem] tracking-[0.08em] text-paper-mute not-italic">By</b>
        {nominatorName(nomination)}
        {own && <span className="not-italic"> (you)</span>}
      </span>
      {nomination.reason && (
        <span className={cn("col-start-1 line-clamp-2 text-[0.88rem] text-paper-mute", struck)}>
          &ldquo;{nomination.reason}&rdquo;
        </span>
      )}
      {!held && (
        <span className="col-start-2 row-span-3 row-start-1 self-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-paper-dim hover:text-destructive"
            onClick={onDelete}
            aria-label={`Delete the nomination of ${title} by ${nominatorName(nomination)}`}
            title="Delete with a reason"
          >
            <Trash2 />
          </Button>
        </span>
      )}
      {held && (
        <UndoBar
          className="col-span-2 mt-1.5"
          message={own ? "Deleted. Your own: no announcement." : "Deleted. The bot then posts the change with your reason."}
          delayMs={delayMs}
          onUndo={onUndo}
        />
      )}
      {error && (
        <p role="alert" className="col-span-2 mt-1 text-sm text-destructive">
          {"Couldn't delete it: "}
          {error}
        </p>
      )}
    </li>
  );
}

function ReasonBox({
  category,
  nomination,
  round,
  own,
  viewerName,
  votesCast,
  reason,
  onReason,
  onConfirm,
  onCancel,
}: {
  category: VotingCategory;
  nomination: Nomination;
  round: number;
  own: boolean;
  viewerName: string;
  votesCast: boolean;
  reason: string;
  onReason: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const id = useId();
  const title = gameTitle(nomination) ?? "No game named";
  const ready = own || reason.trim().length > 0;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="text-[1.05rem] font-bold break-words">{title}</h3>
        <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-highlight">
          Deleting
        </span>
      </div>
      <p className="text-[0.9rem] text-paper-dim">
        {TRACK_NAME[category]} round {round}, nominated by {nominatorName(nomination)}
        {own && " (you)"}.{votesCast && " Any votes cast on it go too."}
      </p>
      <label htmlFor={`${id}-reason`} className={cn(fieldLabel, "mt-3")}>
        {own ? "Reason (optional: your own posts nothing)" : "Reason, posted with the change"}
      </label>
      <textarea
        id={`${id}-reason`}
        value={reason}
        onChange={(e) => onReason(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready) onConfirm();
          if (e.key === "Escape") onCancel();
        }}
        rows={2}
        maxLength={REMOVAL_REASON_MAX}
        autoFocus
        aria-describedby={`${id}-count`}
        className="mt-1.5 w-full rounded-sm border border-rule bg-ink px-3 py-2 text-sm text-paper caret-highlight outline-none placeholder:text-paper-mute focus-visible:border-paper-mute focus-visible:ring-2 focus-visible:ring-highlight/40"
        placeholder={own ? "" : "e.g. Already won GOTM in round 120"}
      />
      <p id={`${id}-count`} className="text-right text-[0.75rem] text-paper-mute">
        {reason.length}/{REMOVAL_REASON_MAX}
      </p>
      {!own && (
        <NoticeText
          className="mt-1 rounded-sm bg-ink p-2.5"
          category={category}
          round={round}
          deleter={viewerName}
          nominator={nominatorName(nomination)}
          title={gameTitle(nomination)}
          reason={reason.trim() || "…"}
        />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="destructive-solid" size="sm" disabled={!ready} onClick={onConfirm}>
          <Scissors data-icon="inline-start" />
          {own ? "Delete" : "Delete with reason"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <span className="ml-auto text-[0.8rem] text-paper-mute">You get {Math.round(UNDO_DELAY_MS / 1000)} s to undo</span>
      </div>
    </div>
  );
}

// The bot's notice in the nomination channel, as bot#1507 words it.
function NoticeText({
  category,
  round,
  deleter,
  nominator,
  title,
  reason,
  className,
}: {
  category: VotingCategory;
  round: number;
  deleter: string;
  nominator: string;
  title: string | null;
  reason: string;
  className?: string;
}) {
  const mention = "rounded-xs bg-paper/12 px-1 font-semibold text-paper";
  return (
    <p className={cn("text-[0.9rem] leading-[1.45] text-paper-dim", className)}>
      <span className={mention}>@{deleter}</span> deleted <span className={mention}>@{nominator}</span>
      &apos;s nomination{title && <> &ldquo;{title}&rdquo;</>} for {TRACK_NAME[category]} Round {round}. Reason:{" "}
      <span className="text-paper">{reason}</span>
    </p>
  );
}

function DeletedProof({ deleted, round, viewerName }: { deleted: Deleted; round: number; viewerName: string }) {
  const n = deleted.nomination;
  const title = gameTitle(n) ?? "No game named";
  if (deleted.own) {
    return (
      <p className="text-[0.93rem] text-paper-dim">
        <span className="font-bold text-paper-mute line-through decoration-destructive">{title}</span>
        <br />
        Your nomination is deleted. Nothing is posted for your own.
      </p>
    );
  }
  return (
    <ProofCard
      bare
      jobId={deleted.jobId}
      what="The announcement"
      caption={deleted.jobId != null ? null : "Deleted. The API queued no announcement for it."}
    >
      <div className="rounded-sm bg-ink-2 py-3 pr-36 pl-3">
        <p className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-paper-mute">
          Nomination change · with the refreshed list
        </p>
        <NoticeText
          className="mt-1"
          category={deleted.category}
          round={round}
          deleter={viewerName}
          nominator={nominatorName(n)}
          title={gameTitle(n)}
          reason={deleted.reason}
        />
      </div>
    </ProofCard>
  );
}
