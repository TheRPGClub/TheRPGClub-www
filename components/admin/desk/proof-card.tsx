"use client";

import type { ReactNode } from "react";
import type { BotJob } from "@/lib/api/types";
import { botJobPhase } from "@/lib/bot-jobs";
import { useBotJob } from "@/hooks/use-bot-job";
import { BotJobStatusView } from "@/components/bot-job-status";
import { Stamp } from "@/components/admin/desk/stamp";
import { cn } from "@/lib/utils";

type ProofChildren = ReactNode | ((job: BotJob | null) => ReactNode);

export interface ProofCardProps {
  // The proof itself: what will be posted, drawn by the tool (a poster, a
  // message). A function gets the job as it last read, e.g. to add the
  // thread link once it is done.
  children: ProofChildren;
  // Set once the form was sent: stamps the proof and follows the job.
  jobId?: number | null;
  initialJob?: BotJob | null;
  // The Discord side in staff words, for the status line ("The live event").
  what?: string;
  // A note under the proof, e.g. "The proof shows the image as Discord crops it."
  caption?: ReactNode;
  // Drop the lifted frame (rounded, clipped, soft shadow) for proofs that
  // draw their own.
  bare?: boolean;
  className?: string;
}

// A proof of what a form will post. Before sending it is just the proof;
// once a job id is handed in it is stamped Queued in the corner, and the
// stamp follows the job (the same refresh run as <BotJobStatus>, whose
// status line sits under the proof) to Done or Failed.
export function ProofCard(props: ProofCardProps) {
  if (props.jobId == null) {
    return (
      <ProofFrame {...props}>
        {typeof props.children === "function" ? props.children(null) : props.children}
      </ProofFrame>
    );
  }
  // Keyed so a new job starts its own refresh run.
  return <SentProof key={props.jobId} {...props} jobId={props.jobId} />;
}

function SentProof(props: ProofCardProps & { jobId: number }) {
  const state = useBotJob(props.jobId, props.initialJob);
  const phase = botJobPhase(state.job?.status ?? "queued");
  return (
    <ProofFrame
      {...props}
      stamp={<Stamp key={phase} phase={phase} size="lg" />}
      status={<BotJobStatusView state={state} what={props.what} className="mt-3" />}
    >
      {typeof props.children === "function" ? props.children(state.job) : props.children}
    </ProofFrame>
  );
}

function ProofFrame({
  children,
  caption,
  bare,
  className,
  stamp,
  status,
}: Omit<ProofCardProps, "children"> & {
  children: ReactNode;
  stamp?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          !bare && "overflow-hidden rounded-md shadow-[0_24px_60px_rgb(0_0_0/0.55)]",
        )}
      >
        {children}
      </div>
      {stamp && <div className="absolute top-[22px] right-2 sm:-right-3.5">{stamp}</div>}
      {status}
      {caption && <figcaption className="mt-3 text-[0.82rem] text-paper-mute">{caption}</figcaption>}
    </figure>
  );
}
