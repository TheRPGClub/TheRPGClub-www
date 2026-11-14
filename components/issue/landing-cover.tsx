import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicWinner } from "@/lib/api/types";
import { buttonVariants } from "@/components/ui/button";
import { Starburst } from "@/components/issue/starburst";
import { cn } from "@/lib/utils";

// The landing's opening spread. With this round's Game of the Month in hand
// it is a magazine cover: the winner's key art full-bleed under the masthead,
// stamped with the GOTM starburst. LandingPitch is the masthead, headline and
// calls to action, shared with the flat fallback hero in app/(public)/page.tsx.

const ctaClass = "h-13 px-6 text-lg max-sm:w-full";

export function LandingPitch({
  signInHref,
  profileHref,
  className,
}: {
  signInHref: string;
  profileHref: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <p
        aria-hidden
        className="font-headline text-[5.75rem] leading-[0.8] tracking-[-0.01em] sm:text-[8rem] xl:text-[9.75rem]"
      >
        The <span className="text-gotm">RPG</span>
        <br />
        Club
      </p>
      <h1 className="font-headline mt-12 max-w-[15ch] text-[2.75rem] leading-[0.92] text-balance sm:mt-16 sm:text-[4rem]">
        <span className="sr-only">The RPG Club: </span>
        An <span className="text-gotm">RPG</span> and a{" "}
        <span className="text-nr-soft">wildcard</span>, every month.{" "}
        <span className="text-highlight">Played together.</span>
      </h1>
      <p className="mt-5 max-w-[50ch] text-base text-dim-foreground sm:text-[1.05rem]">
        The RPG Club is a Discord community that votes on a Game of the Month
        and plays it together, with a second pick for everything that
        isn&apos;t an RPG. This site is the club&apos;s hub: the current round,
        the ballot, every past winner, and every member&apos;s shelf.
      </p>
      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <a
          href={signInHref}
          className={cn(
            buttonVariants({ variant: "highlight", size: "lg" }),
            ctaClass,
          )}
        >
          Sign in with Discord
          <ArrowRight data-icon="inline-end" />
        </a>
        {profileHref ? (
          <Link
            href={profileHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              ctaClass,
            )}
          >
            My Profile
          </Link>
        ) : (
          <a
            href="#how"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              ctaClass,
            )}
          >
            How the club works
          </a>
        )}
      </div>
    </div>
  );
}

export function LandingCover({
  lead,
  issueNumber,
  signInHref,
  profileHref,
  notice,
}: {
  // This round's lead Game of the Month.
  lead: PublicWinner;
  // The latest round's number: rounds are the club's issues, numbered from 1.
  issueNumber: number;
  signInHref: string;
  profileHref: string | null;
  // A notice slip (sign-in failed), pinned over the cover art.
  notice?: React.ReactNode;
}) {
  const art = lead.art_url;

  return (
    <section className="relative isolate flex flex-col overflow-hidden md:min-h-[53.75rem]">
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-x-0 top-0 -z-20 h-[32.5rem] w-full object-cover object-[70%_20%] md:h-full md:object-[62%_30%]"
        />
      ) : (
        // No key art: the winner's name, set huge in the art's place.
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-20 flex h-[32.5rem] items-center justify-end overflow-hidden bg-card md:inset-y-0 md:left-[40%] md:h-full"
        >
          <span className="font-headline -mr-[0.06em] max-w-[9ch] text-right text-[7rem] leading-[0.85] text-balance text-muted md:text-[11rem] xl:text-[14rem]">
            {lead.title}
          </span>
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[32.5rem] bg-[linear-gradient(0deg,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_92%,transparent)_40%,color-mix(in_oklab,var(--color-background)_10%,transparent)_70%,color-mix(in_oklab,var(--color-background)_50%,transparent)_100%)] md:h-full md:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_0%,color-mix(in_oklab,var(--color-background)_86%,transparent)_36%,color-mix(in_oklab,var(--color-background)_12%,transparent)_70%,color-mix(in_oklab,var(--color-background)_30%,transparent)_100%),linear-gradient(0deg,var(--color-background)_0%,transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_70%,transparent)_0%,transparent_22%)]"
      />

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
        profileHref={profileHref}
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
            `${issueNumber} ${issueNumber === 1 ? "issue" : "issues"} and counting`,
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
