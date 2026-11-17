import { FORMAT_NAME, slotSquares } from "@/lib/challenges/board";
import type { ChallengePage } from "@/lib/challenges/challenge-page";
import type { BannerNumeral } from "@/lib/challenges/edition";
import { hostAvatar, hostName } from "@/lib/challenges/facts";
import { tintStyle } from "@/lib/challenges/tint";
import { cn } from "@/lib/utils";
import { splitGameTitle } from "@/components/issue/game-cover";
import { FormatSquare } from "@/components/challenges/format-mark";
import { SlotRow } from "@/components/challenges/format-picture";
import { DoorsPicture } from "@/components/challenges/assignment/doors-picture";
import { MemberMark } from "@/components/challenges/host-badge";

// The Challenge banner, shared by every Challenge page (surface brief
// challenges-pool, 2D): the key art over the tint, under the black
// legibility scrim from the left; the tint chip and the Format chip; the
// name as a two-line Anton headline whose second line takes the tint's hi;
// and the numbers on an ink plate, days left first in the tint's hi. An
// Edition page (www#110) passes its own chip ("Edition 2026"), its phase's
// numerals and the Host chip.
export function ChallengeBanner({
  page,
  badge,
  chip: chipOverride,
  numerals,
  hostChip = false,
}: {
  page: ChallengePage;
  badge?: React.ReactNode;
  chip?: string;
  numerals?: BannerNumeral[];
  hostChip?: boolean;
}) {
  const { challenge, art, daysLeft, runCount, finished, tint, today } = page;
  const chip = chipOverride ?? page.chip;
  const [first, second] = splitGameTitle(challenge.name);
  return (
    <header
      style={tintStyle(tint)}
      className="bleed relative -mt-6 flex min-h-[260px] items-end overflow-hidden bg-(--challenge-tint) sm:min-h-[330px]"
    >
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img src={art} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute top-6 right-6 hidden w-[270px] opacity-90 sm:block sm:right-10">
          {challenge.challenge_format === "slots" && (
            <SlotRow squares={slotSquares(challenge, undefined, today)} size="lg" />
          )}
          {challenge.challenge_format === "assignment" && <DoorsPicture />}
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-background/96 via-background/82 via-45% to-background/15"
      />
      <div className="relative z-10 flex w-full flex-col gap-4 px-4 pt-8 pb-5 sm:px-7 sm:pb-[26px] lg:flex-row lg:items-end lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {badge}
            <Chip className="bg-(--challenge-tint) text-(--challenge-type)">{chip}</Chip>
            <Chip className="bg-foreground/8 text-dim-foreground">
              <FormatSquare format={challenge.challenge_format} />
              {FORMAT_NAME[challenge.challenge_format]}
            </Chip>
            {hostChip && (
              <Chip className="bg-foreground/8 text-dim-foreground">
                <MemberMark
                  name={hostName(challenge)}
                  src={hostAvatar(challenge)}
                  club={challenge.hosted_by_club}
                  size={14}
                />
                {challenge.hosted_by_club ? "Hosted by the club" : `Hosted by ${hostName(challenge)}`}
              </Chip>
            )}
            {challenge.hidden && <Chip className="bg-foreground text-background">Hidden</Chip>}
          </div>
          <h1 className="font-headline mt-2.5 text-[3rem] leading-[0.86] text-balance break-words text-foreground sm:text-[4.2rem] xl:text-[5.375rem]">
            {first && <span className="block">{first}</span>}
            <span className="block text-(--challenge-tint-hi)">{second}</span>
          </h1>
        </div>
        <dl className="flex w-fit gap-7 rounded-md bg-background/80 px-5 pt-4 pb-3.5 lg:ml-auto">
          {numerals ? (
            numerals.map((n) => <Numeral key={n.label} value={n.value} label={n.label} hi={n.hi} />)
          ) : (
            <>
              {daysLeft != null && <Numeral value={daysLeft} label={daysLeft === 1 ? "Day left" : "Days left"} hi />}
              <Numeral value={runCount} label={runCount === 1 ? "Run" : "Runs"} />
              <Numeral value={finished} label="Finished" />
            </>
          )}
        </dl>
      </div>
    </header>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-label inline-flex h-[22px] items-center gap-[5px] rounded-xs px-[7px] text-[0.78rem] tracking-[0.06em] whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Numeral({ value, label, hi = false }: { value: number; label: string; hi?: boolean }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="font-label text-[0.78rem] leading-[1.3] tracking-[0.08em] text-dim-foreground">{label}</dt>
      <dd
        className={cn(
          "font-headline text-[2.6rem] leading-[0.85] sm:text-[3.25rem]",
          hi ? "text-(--challenge-tint-hi)" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
