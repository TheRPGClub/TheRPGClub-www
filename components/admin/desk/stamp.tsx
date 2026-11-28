import type { BotJobPhase } from "@/lib/bot-jobs";
import { cn } from "@/lib/utils";

const TONE: Record<BotJobPhase, string> = {
  queued: "text-highlight",
  done: "text-ok",
  failed: "text-destructive",
};

const LABEL: Record<BotJobPhase, string> = {
  queued: "Queued",
  done: "Done",
  failed: "Failed",
};

// A bot job's state stamp: Queued (yellow), Done (green), Failed (signal
// orange). `sm` sits in a wire slip; `lg` is the one on a proof card, and
// stamps in when its phase changes (key the stamp on the phase to replay
// it). Its shape, tilt and stamp-in are the Theme's (slot "desk-stamp").
export function Stamp({
  phase,
  size = "sm",
  className,
}: {
  phase: BotJobPhase;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span
      data-slot="desk-stamp"
      data-tone={phase}
      data-size={size}
      className={cn("inline-flex shrink-0 items-center whitespace-nowrap", TONE[phase], className)}
    >
      {LABEL[phase]}
    </span>
  );
}
