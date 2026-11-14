import type { PublicWinner } from "@/lib/api/types";
import { JoinMasthead } from "@/components/join/join-masthead";
import { JoinPanel } from "@/components/join/join-panel";
import { joinSlides } from "@/components/join/join-slides";
import { JoinSlideshow } from "@/components/join/join-slideshow";
import { cn } from "@/lib/utils";

// /join: the club's cover running on the left while the way in stays pinned
// on the right (the invite, then Continue). A second try lifts the panel to
// make room for its note.
export function JoinView({
  winners,
  invite,
  continueHref,
  secondTry,
}: {
  winners: PublicWinner[];
  invite: string;
  continueHref: string;
  secondTry: boolean;
}) {
  return (
    <main className="relative isolate min-h-svh bg-background pb-10 text-foreground lg:min-h-[max(100svh,47rem)] lg:pb-0">
      <JoinMasthead />
      <JoinSlideshow
        slides={joinSlides(winners)}
        className="h-[max(60svh,28rem)] lg:absolute lg:inset-0 lg:h-auto"
      />
      <JoinPanel
        invite={invite}
        continueHref={continueHref}
        secondTry={secondTry}
        className={cn(
          "relative z-10 mx-4 mt-6 sm:mx-10 lg:absolute lg:right-10 lg:m-0 lg:w-[36rem]",
          secondTry ? "lg:top-[4.25rem]" : "lg:top-24",
        )}
      />
    </main>
  );
}
