import type { PublicWinner } from "@/lib/api/types";
import { Starburst } from "@/components/issue/starburst";
import { LandingCoverArt } from "@/components/issue/landing-cover-art";
import { LandingPitch } from "@/components/issue/landing-pitch";
import { cn } from "@/lib/utils";

// The landing's opening spread. With this round's Game of the Month in hand
// it is a magazine cover: the winner's key art full-bleed under the masthead,
// stamped with the GOTM starburst. LandingPitch (landing-pitch.tsx) is the
// masthead, headline and calls to action, shared with the flat fallback hero
// (components/landing).

export function LandingCover({
  lead,
  issueNumber,
  signInHref,
  notice,
}: {
  // This round's lead Game of the Month.
  lead: PublicWinner;
  // The latest round's number: rounds are the club's issues, numbered from 1.
  issueNumber: number;
  signInHref: string;
  // A notice slip (sign-in failed), pinned over the cover art.
  notice?: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex flex-col overflow-hidden md:min-h-[53.75rem]">
      <LandingCoverArt lead={lead} />

      <Starburst
        track="gotm"
        className={cn(
          "absolute top-[14.375rem] right-3.5 z-10 size-31 md:top-[13.125rem] md:right-[min(23.75rem,30vw)] md:size-[11.875rem]",
          // Below xl a notice slip sits where the burst does; the burst steps
          // aside rather than be cut by it.
          notice && "max-xl:hidden",
        )}
        textClassName="text-[1.19rem] md:text-[1.75rem]"
      />

      <p className="font-label absolute top-[16.5rem] left-4 z-10 max-w-[52%] text-[0.8rem] font-extrabold tracking-[0.08em] text-dim-foreground [text-shadow:0_1px_8px_rgb(0_0_0)] md:top-30 md:right-10 md:left-auto md:max-w-[22rem] md:text-right md:text-sm">
        This month the club plays
        <span className="font-headline block pt-0.5 text-[1.6rem] leading-[0.95] tracking-normal text-foreground md:text-[2.5rem]">
          {lead.title}
        </span>
      </p>

      {notice && (
        <div className="absolute inset-x-4 top-[15rem] z-20 flex md:top-[15rem] md:right-10 md:left-auto xl:top-[27rem] xl:right-[24rem]">
          {notice}
        </div>
      )}

      <LandingPitch
        signInHref={signInHref}
        className={cn(
          "relative z-[2] flex-1 px-4 pt-21 pb-8 md:px-10 md:pt-26 md:pb-14 [&>h1]:mt-[13rem] md:[&>h1]:mt-auto md:[&>h1]:pt-12",
          // On a phone the slip sits between the masthead and the headline.
          notice && "max-md:[&>h1]:mt-[17.5rem]",
        )}
      />

      <ul className="relative z-[3] mx-4 mb-9 flex flex-col gap-4 rounded-sm bg-background/82 px-5 py-4.5 md:absolute md:right-10 md:bottom-14 md:m-0 md:w-80">
        {[
          [
            "Nominate, vote, play",
            "Every month the club picks its next games on the ballot.",
          ],
          [
            `${issueNumber} ${issueNumber === 1 ? "round" : "rounds"} and counting`,
            "Every past winner, with its Reddit post and Discord thread.",
          ],
          [
            "Your shelf",
            "Now playing, completed, backlog, collection and reviews.",
          ],
        ].map(([title, body]) => (
          <li
            key={title}
            className="font-label text-lg leading-[1.1] font-extrabold tracking-[0.02em] [text-shadow:0_1px_10px_rgb(0_0_0)] before:mb-2 before:block before:h-1 before:w-7 before:bg-foreground"
          >
            {title}
            <span className="mt-0.5 block font-sans text-sm font-medium tracking-normal text-dim-foreground normal-case">
              {body}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
