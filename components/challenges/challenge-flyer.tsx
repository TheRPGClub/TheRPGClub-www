import type { CSSProperties } from "react";
import type { FlyerExtras } from "@/lib/challenges/board";
import type { RunAction } from "@/lib/challenges/run-action";
import { closedNote, whenLabel } from "@/lib/challenges/dates";
import { hostAvatar, hostName } from "@/lib/challenges/facts";
import { challengeTint, flyerTilt, tintStyle } from "@/lib/challenges/tint";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { FormatLabel } from "@/components/challenges/format-mark";
import { HostLine } from "@/components/challenges/host-badge";
import { Count, FlyerTitle, FormatPicture, Tape, YourRunChip } from "@/components/challenges/flyer-parts";
import { StartRunButton } from "@/components/challenges/start-run-button";

// A Challenge pinned to the board (surface brief challenges-index, 1C): a
// card in the Challenge's tint, paper type, resting at its stable tilt and
// straightening on hover or focus. A Closed one is muted into the ink with
// its opening date taped across the top; a hidden one (staff and its Host
// see it) is taped "Hidden". The whole card links to the Challenge page;
// Start a Run sits above that link.
export function ChallengeFlyer({
  challenge,
  extras,
  run,
  action,
  today,
}: {
  challenge: Challenge;
  extras: FlyerExtras | undefined;
  run: ChallengeRun | undefined;
  action?: RunAction;
  today: string;
}) {
  const tilt = flyerTilt(challenge.id);
  const closed = !challenge.open;
  const tape = challenge.hidden ? "Hidden" : closedNote(challenge, today);
  const style = {
    ...tintStyle(challengeTint(challenge)),
    "--tilt": `${tilt}deg`,
    "--tilt-sm": `${tilt / 2}deg`,
  } as CSSProperties;
  return (
    <article
      style={style}
      className={cn(
        "relative rotate-(--tilt-sm) rounded-md px-5 pt-5 pb-4 text-(--challenge-type) shadow-[0_12px_30px_rgb(0_0_0/0.5)] motion-safe:transition-transform motion-safe:duration-200 sm:rotate-(--tilt) motion-safe:hover:rotate-0 motion-safe:focus-within:rotate-0 sm:motion-safe:hover:rotate-0 sm:motion-safe:focus-within:rotate-0",
        closed ? "bg-[color-mix(in_srgb,var(--challenge-tint)_35%,var(--color-muted))]" : "bg-(--challenge-tint)",
      )}
    >
      {tape && <Tape>{tape}</Tape>}
      <FormatLabel format={challenge.challenge_format} when={whenLabel(challenge)} />
      <FlyerTitle challenge={challenge} className="my-2.5 line-clamp-2 text-[2.5rem] leading-[0.88]" />
      <FormatPicture challenge={challenge} extras={extras} run={run} today={today} />
      {challenge.description && (
        <p className={cn("mb-3.5 line-clamp-3 text-[0.9rem] leading-[1.4]", closed && "text-dim-foreground")}>
          {challenge.description}
        </p>
      )}
      <footer className="flex items-center gap-2 border-t border-(--challenge-type)/30 pt-3 text-sm">
        <HostLine name={hostName(challenge)} club={challenge.hosted_by_club} avatar={hostAvatar(challenge)} />
        <Count value={extras?.runCount ?? null} label={extras?.runCount === 1 ? "Run" : "Runs"} className="ml-auto" />
      </footer>
      {(run || action?.kind === "start") && (
        <div className="mt-3 flex flex-col items-start gap-2.5">
          {run && <YourRunChip run={run} />}
          {action?.kind === "start" && <StartRunButton challengeId={challenge.id} again={action.again} />}
        </div>
      )}
    </article>
  );
}
