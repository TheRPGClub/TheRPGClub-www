import { FORMAT_NAME } from "@/lib/challenges/board";
import type { ChallengePage } from "@/lib/challenges/challenge-page";
import type { BannerNumeral } from "@/lib/challenges/edition";
import { hostAvatar, hostName, hostUserId, slotsChips } from "@/lib/challenges/facts";
import { tintStyle } from "@/lib/challenges/tint";
import { cn } from "@/lib/utils";
import { splitGameTitle } from "@/components/issue/game-cover";
import { FormatSquare } from "@/components/challenges/format-mark";
import { SlotRow } from "@/components/challenges/format-picture";
import { DoorsPicture } from "@/components/challenges/assignment/doors-picture";
import { MemberMark } from "@/components/challenges/host-badge";
import { MemberLink } from "@/components/member/member-link";
import { Numeral } from "@/components/challenges/banner-numeral";
import { BackLink } from "@/components/shell/back-link";
import { MadeFrom } from "@/components/challenges/made-from";

// The Challenge banner, shared by every Challenge page (surface brief
// challenges-pool, 2D): the key art over the tint, under the black
// legibility scrim from the left; the tint chip and the Format chip; the
// name as a two-line Anton headline whose second line takes the tint's hi;
// and the numbers on an ink plate, days left first in the tint's hi. An
// Edition page (www#110) passes its own chip ("Edition 2026"), its phase's
// numerals and the Host chip. Its top-left corner holds the way back to
// the Challenges.
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
  const { challenge, art, daysLeft, runCount, finished, tint } = page;
  const chip = chipOverride ?? page.chip;
  // A growing Slots range counts its Caught Up Runs rather than Finished ones.
  const caughtUp = challenge.slots?.last_year === "current_year";
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
          {page.slotPicture && <SlotRow squares={page.slotPicture} size="lg" />}
          {challenge.challenge_format === "assignment" && <DoorsPicture />}
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-background/96 via-background/82 via-45% to-background/15"
      />
      {/* The way back to the Challenges, on the banner's top edge. */}
      <BackLink href="/challenges" label="Challenges" onArt className="absolute top-4 left-4 z-20 mb-0 sm:left-7 md:top-5" />
      <div className="relative z-10 flex w-full flex-col gap-4 px-4 pt-16 pb-5 sm:px-7 sm:pb-[26px] lg:flex-row lg:items-end lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {badge}
            <Chip className="bg-(--challenge-tint) text-(--challenge-type)">{chip}</Chip>
            <Chip className="bg-foreground/8 text-dim-foreground">
              <FormatSquare format={challenge.challenge_format} />
              {FORMAT_NAME[challenge.challenge_format]}
            </Chip>
            {challenge.pool?.game_list && (
              <Chip className="max-w-full bg-foreground/8 text-dim-foreground">
                <MadeFrom list={challenge.pool.game_list} />
              </Chip>
            )}
            {hostChip && (
              <Chip className="bg-foreground/8 text-dim-foreground">
                <MemberLink userId={hostUserId(challenge)} className="inline-flex items-center gap-[5px]">
                  <MemberMark name={hostName(challenge)} src={hostAvatar(challenge)} club={challenge.hosted_by_club} size={14} />
                  {challenge.hosted_by_club ? "Hosted by the club" : `Hosted by ${hostName(challenge)}`}
                </MemberLink>
              </Chip>
            )}
            {slotsChips(challenge).map((extra) => (
              <Chip key={extra} className="bg-foreground/8 text-dim-foreground">
                {extra}
              </Chip>
            ))}
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
              <Numeral
                value={runCount}
                label={runCount === 1 ? "Run" : "Runs"}
                hi={daysLeft == null && !!page.slotPicture}
              />
              {caughtUp ? <Numeral value={page.caughtUp} label="Caught Up" /> : <Numeral value={finished} label="Finished" />}
            </>
          )}
        </dl>
      </div>
    </header>
  );
}

// A banner chip (also the pick page header's): label type on its own ground.
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
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
