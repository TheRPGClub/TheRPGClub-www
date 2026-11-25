import type { GotyNomination, GotyVote } from "@/lib/api/goty";
import { gotyNominatorName } from "@/lib/goty-desk";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { cn } from "@/lib/utils";

export interface DeletedGotyNomination {
  nomination: GotyNomination;
  reason: string;
  own: boolean;
  jobId: number | null;
}

// The bot's notice in the nomination channel (job goty_nomination_deleted),
// worded as the bot posts it (buildGotyNominationDeletedNotice, bot#1583):
// "@A deleted @B's GOTY Vote 2026 Game of the Year nomination "X". Reason: ..."
export function GotyNominationNotice({
  vote,
  deleter,
  nominator,
  title,
  reason,
  className,
}: {
  vote: GotyVote;
  deleter: string;
  nominator: string;
  title: string | null;
  reason: string;
  className?: string;
}) {
  const mention = "rounded-xs bg-foreground/12 px-1 font-semibold text-foreground";
  return (
    <p className={cn("text-[0.9rem] leading-[1.45] text-dim-foreground", className)}>
      <span className={mention}>@{deleter}</span> deleted <span className={mention}>@{nominator}</span>
      &apos;s GOTY Vote {vote.year} Game of the Year nomination{title && <> &ldquo;{title}&rdquo;</>}. Reason:{" "}
      <span className="text-foreground">{reason}</span>
    </p>
  );
}

// A removed entry, kept in place: your own just reads as removed; anyone
// else's turns into the proof of the bot's announcement, stamped with its job.
export function DeletedGotyNominationProof({
  deleted,
  vote,
  viewerName,
}: {
  deleted: DeletedGotyNomination;
  vote: GotyVote;
  viewerName: string;
}) {
  const n = deleted.nomination;
  const title = n.game?.title ?? `Game ${n.gamedb_game_id}`;
  if (deleted.own) {
    return (
      <p className="text-[0.93rem] text-dim-foreground">
        <span className="font-bold text-faint-foreground line-through decoration-destructive">{title}</span>
        <br />
        Your nomination is removed. Nothing is posted for your own.
      </p>
    );
  }
  return (
    <ProofCard
      bare
      jobId={deleted.jobId}
      what="The announcement"
      caption={deleted.jobId != null ? null : "Removed. The API queued no announcement for it."}
    >
      <div className="rounded-sm bg-card py-3 pr-36 pl-3">
        <p className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">
          GOTY nomination change
        </p>
        <GotyNominationNotice
          className="mt-1"
          vote={vote}
          deleter={viewerName}
          nominator={gotyNominatorName(n)}
          title={n.game?.title ?? null}
          reason={deleted.reason}
        />
      </div>
    </ProofCard>
  );
}
