import type { PublicWinner } from "@/lib/api/types";
import { coverLead, marqueeItems } from "@/lib/front-page";
import { LandingCover } from "@/components/issue/landing-cover";
import { LandingMarquee } from "@/components/issue/landing-marquee";
import { SignInFailedSlip } from "@/components/issue/sign-in-failed-slip";
import { FlatHero } from "@/components/landing/flat-hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingClose } from "@/components/landing/landing-close";
import { LandingFooter } from "@/components/landing/landing-footer";
import { TwoTracks } from "@/components/landing/two-tracks";
import { YourShelf } from "@/components/landing/your-shelf";

// The front page: the club pitched as its own magazine, for everyone. With
// public winners, this round's Game of the Month is the cover, the two
// tracks show their latest picks and the winners marquee runs at the foot.
// Without them (the read failed or came back empty), the page describes the
// club in plain words only: flat track panels for a cover, no shelves, no
// marquee.
export function FrontPage({
  winners,
  signInHref,
  profileHref,
  authFailed,
}: {
  winners: PublicWinner[];
  signInHref: string;
  // The signed-in viewer's own member page; null for a Visitor.
  profileHref: string | null;
  // The API sent a failed sign-in back here (/?error=auth_failed).
  authFailed: boolean;
}) {
  const notice = authFailed ? <SignInFailedSlip signInHref={signInHref} /> : null;
  const cover = coverLead(winners);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <main className="flex-1">
        {cover ? (
          <LandingCover
            lead={cover.lead}
            issueNumber={cover.roundNumber}
            signInHref={signInHref}
            profileHref={profileHref}
            notice={notice}
          />
        ) : (
          <FlatHero signInHref={signInHref} profileHref={profileHref} notice={notice} />
        )}
        <HowItWorks />
        <TwoTracks winners={winners} />
        <YourShelf />
        <LandingClose signInHref={signInHref} />
        <LandingMarquee items={marqueeItems(winners)} />
      </main>
      <LandingFooter />
    </div>
  );
}
