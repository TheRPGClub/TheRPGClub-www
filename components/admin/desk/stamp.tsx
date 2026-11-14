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

// A rubber stamp for a bot job: Queued (yellow), Done (green), Failed
// (signal orange), pressed on at a slight tilt. `sm` sits in a wire slip;
// `lg` is the one on a proof card, and stamps in when its phase changes
// (key the stamp on the phase to replay it).
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
      className={cn(
        "font-headline inline-flex shrink-0 items-center rounded-xs leading-none whitespace-nowrap [--burst-rot:-4deg]",
        size === "sm"
          ? "-rotate-4 px-2.5 pt-[5px] pb-[3px] text-[1.05rem] shadow-[inset_0_0_0_2px_currentColor]"
          : "motion-reduce:-rotate-4 bg-background/75 px-3.5 pt-[9px] pb-[6px] text-[1.9rem] shadow-[inset_0_0_0_3px_currentColor,0_6px_14px_rgb(0_0_0/0.45)] motion-safe:animate-[burst-stamp_480ms_cubic-bezier(0.16,1,0.3,1)_both]",
        TONE[phase],
        className,
      )}
    >
      {LABEL[phase]}
    </span>
  );
}
