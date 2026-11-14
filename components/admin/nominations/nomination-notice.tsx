import type { Nomination, VotingCategory } from "@/lib/api/types";
import { nominatorName, TRACK_NAME } from "@/lib/rounds";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { cn } from "@/lib/utils";

export interface DeletedNomination {
  category: VotingCategory;
  nomination: Nomination;
  reason: string;
  own: boolean;
  jobId: number | null;
}

// The bot's notice in the nomination channel, as bot#1507 words it.
export function NominationNotice({
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
  const mention = "rounded-xs bg-foreground/12 px-1 font-semibold text-foreground";
  return (
    <p className={cn("text-[0.9rem] leading-[1.45] text-dim-foreground", className)}>
      <span className={mention}>@{deleter}</span> deleted <span className={mention}>@{nominator}</span>
      &apos;s nomination{title && <> &ldquo;{title}&rdquo;</>} for {TRACK_NAME[category]} Round {round}. Reason:{" "}
      <span className="text-foreground">{reason}</span>
    </p>
  );
}

// A deleted entry, kept in place: your own just reads as deleted; anyone
// else's turns into the proof of the bot's announcement, stamped with its job.
export function DeletedNominationProof({
  deleted,
  round,
  viewerName,
}: {
  deleted: DeletedNomination;
  round: number;
  viewerName: string;
}) {
  const n = deleted.nomination;
  const title = n.game?.title ?? "No game named";
  if (deleted.own) {
    return (
      <p className="text-[0.93rem] text-dim-foreground">
        <span className="font-bold text-faint-foreground line-through decoration-destructive">{title}</span>
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
      <div className="rounded-sm bg-card py-3 pr-36 pl-3">
        <p className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">
          Nomination change · with the refreshed list
        </p>
        <NominationNotice
          className="mt-1"
          category={deleted.category}
          round={round}
          deleter={viewerName}
          nominator={nominatorName(n)}
          title={n.game?.title ?? null}
          reason={deleted.reason}
        />
      </div>
    </ProofCard>
  );
}
