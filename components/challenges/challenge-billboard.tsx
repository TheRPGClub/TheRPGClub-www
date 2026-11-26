import type { FlyerExtras, Clock } from "@/lib/challenges/board";
import { whenLabel } from "@/lib/challenges/dates";
import { onBoard, type RunAction } from "@/lib/challenges/run-action";
import { hostAvatar, hostName, hostUserId } from "@/lib/challenges/facts";
import { challengeTint, tintStyle } from "@/lib/challenges/tint";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";
import { FormatLabel } from "@/components/challenges/format-mark";
import { HostLine } from "@/components/challenges/host-badge";
import { Count, FlyerTitle, FormatPicture, Tape, YourRunChip } from "@/components/challenges/flyer-parts";
import { BoardAction } from "@/components/challenges/board-action";

// A running Challenge pasted up as a billboard (surface brief
// challenges-index, 1A's lead card in flyer language): a straight flyer at
// double width with a heavier shadow, its days-left numeral at monumental
// scale beside the Format's picture, and Host, Runs and Finished along the
// foot.
export function ChallengeBillboard({
  challenge,
  clock,
  extras,
  run,
  action,
  today,
}: {
  challenge: Challenge;
  clock: Clock;
  extras: FlyerExtras | undefined;
  run: ChallengeRun | undefined;
  action?: RunAction;
  today: string;
}) {
  const edition = challenge.assignment?.edition;
  const when = edition ? `Edition ${edition.year}` : whenLabel(challenge);
  return (
    <article
      style={tintStyle(challengeTint(challenge))}
      className="relative grid grid-cols-1 gap-x-5 rounded-md bg-(--challenge-tint) px-5 pt-5 pb-5 text-(--challenge-type) shadow-[0_18px_40px_rgb(0_0_0/0.55)] sm:grid-cols-[minmax(0,1fr)_196px] sm:px-6 sm:pt-[22px]"
    >
      {challenge.hidden && <Tape>Hidden</Tape>}
      <div className="min-w-0">
        <FormatLabel format={challenge.challenge_format} when={when} className="py-1.5" />
        <div className="mt-3 flex items-baseline gap-2 sm:hidden">
          <b className="font-headline text-[5rem] leading-[0.78] font-normal">{clock.days}</b>
          <span className="font-label text-[0.82rem] font-extrabold tracking-[0.1em]">{clock.caption}</span>
        </div>
        <FlyerTitle challenge={challenge} className="mt-3.5 mb-3 text-[2.6rem] leading-[0.86] sm:text-[3.625rem]" />
        {challenge.description && (
          <p className="mb-4 line-clamp-4 max-w-[44ch] text-[0.97rem] leading-[1.45]">{challenge.description}</p>
        )}
      </div>
      <div className="flex flex-col items-start gap-3.5 sm:items-end">
        <p className="hidden text-right sm:block">
          <b className="font-headline block text-[7rem] leading-[0.78] font-normal">{clock.days}</b>
          <span className="font-label text-[0.82rem] leading-[1.2] font-extrabold tracking-[0.1em]">
            {clock.caption}
          </span>
        </p>
        <FormatPicture challenge={challenge} extras={extras} run={run} today={today} size="lg" />
      </div>
      <footer className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-3 border-t border-(--challenge-type)/35 pt-3.5 text-[0.9rem] sm:col-span-2">
        <HostLine name={hostName(challenge)} club={challenge.hosted_by_club} avatar={hostAvatar(challenge)} userId={hostUserId(challenge)} />
        <Count value={extras?.runCount ?? null} label={extras?.runCount === 1 ? "Run" : "Runs"} className="ml-3" />
        <Count value={extras?.finished ?? null} label="Finished" className="ml-3" />
        {(run || onBoard(action)) && (
          <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
            {run && <YourRunChip run={run} bar={challenge.challenge_format === "pool"} />}
            <BoardAction action={action} challengeId={challenge.id} today={today} />
          </div>
        )}
      </footer>
    </article>
  );
}
