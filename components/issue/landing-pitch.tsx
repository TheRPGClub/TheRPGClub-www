import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The landing's masthead, headline and calls to action: the cover's pitch,
// shared with the flat fallback hero in app/(public)/page.tsx.

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
        <ButtonLink
          render={<a />}
          href={signInHref}
          variant="highlight"
          size="lg"
          className={ctaClass}
        >
          Sign in with Discord
          <ArrowRight data-icon="inline-end" />
        </ButtonLink>
        {profileHref ? (
          <ButtonLink
            href={profileHref}
            variant="outline"
            size="lg"
            className={ctaClass}
          >
            My Profile
          </ButtonLink>
        ) : (
          <ButtonLink
            render={<a />}
            href="#how"
            variant="outline"
            size="lg"
            className={ctaClass}
          >
            How the club works
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
