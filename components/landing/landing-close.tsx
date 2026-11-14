import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

// The front page's closing call: the yellow panel with sign-in.
export function LandingClose({ signInHref }: { signInHref: string }) {
  return (
    <section className="grid gap-7 bg-highlight px-4 py-11 text-highlight-foreground sm:px-10 sm:py-16 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <h2 className="font-headline text-[3.4rem] leading-[0.86] sm:text-[5.25rem]">
          Pull up
          <br />a chair.
        </h2>
        <p className="mt-3.5 max-w-[52ch] font-medium text-highlight-muted-foreground">
          Sign in with your Discord account to join the round, vote on the
          ballot and start your shelf.
        </p>
      </div>
      <ButtonLink
        render={<a />}
        href={signInHref}
        size="lg"
        variant="inverse"
        className="h-13 px-6 text-lg"
      >
        Sign in with Discord
        <ArrowRight data-icon="inline-end" />
      </ButtonLink>
    </section>
  );
}
