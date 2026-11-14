import { ArrowRight, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { cn } from "@/lib/utils";

// The way in, pinned beside the slideshow and never moving with it: two
// steps (open the invite, then continue) on the highlighter-yellow panel.
// On a second try a notice slip lands on its top edge; the steps stay.

const action = "h-11.5 px-4 text-base max-sm:w-full";

function Step({
  n,
  title,
  body,
  children,
  className,
}: {
  n: number;
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("pt-4.5 pb-1", className)}>
      <span aria-hidden className="font-headline block text-[4.5rem] leading-[0.78] sm:text-[6rem]">
        {n}
      </span>
      <h2 className="font-headline mt-3 text-[1.4rem] leading-none">
        <span className="sr-only">Step {n}: </span>
        {title}
      </h2>
      <p className="mt-1.5 text-[0.9rem] leading-[1.4] text-highlight-muted-foreground">{body}</p>
      <div className="mt-3.5">{children}</div>
    </li>
  );
}

export function JoinPanel({
  invite,
  continueHref,
  secondTry,
  className,
}: {
  invite: string;
  continueHref: string;
  secondTry: boolean;
  // Placement only.
  className?: string;
}) {
  return (
    <aside aria-labelledby="join-title" className={className}>
      {secondTry && (
        <NoticeSlip title="Not in the server yet." className="relative z-10 -mb-5 ml-2 w-[min(22rem,calc(100%-1rem))] sm:-ml-8">
          Open the invite again and press <strong>Accept Invite</strong> in Discord, then continue. It
          can take a moment to show up.
        </NoticeSlip>
      )}
      <div className="rounded-md bg-highlight p-5 text-highlight-foreground shadow-[0_24px_60px_rgb(0_0_0/0.6)] sm:p-7.5">
        <h1 id="join-title" className={cn("font-headline text-[2.75rem] leading-[0.86] sm:text-[3.6rem]", secondTry && "pt-5")}>
          Pull up a chair.
        </h1>
        <p className="mt-3 leading-[1.45] font-medium text-highlight-muted-foreground">
          You&apos;re signed in with Discord, but you&apos;re not in the club&apos;s server yet. The
          server is the membership.
        </p>
        <ol className="mt-5.5 grid border-t-2 border-highlight-foreground sm:grid-cols-2">
          <Step n={1} title="Join the server" body="The invite opens Discord. Press Accept Invite there." className="sm:pr-4.5">
            <a href={invite} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "inverse" }), action)}>
              Open the invite
              <ExternalLink data-icon="inline-end" />
              <span className="sr-only">(opens Discord in a new tab)</span>
            </a>
          </Step>
          <Step
            n={2}
            title="Come back in"
            body="We'll check the server and take you where you were going."
            className="max-sm:mt-4 max-sm:border-t max-sm:border-highlight-foreground/25 sm:border-l sm:border-highlight-foreground/25 sm:pl-4.5"
          >
            <a href={continueHref} className={cn(buttonVariants({ variant: "inverse-outline" }), action)}>
              Continue
              <ArrowRight data-icon="inline-end" />
            </a>
          </Step>
        </ol>
        <p className="mt-4.5 text-[0.82rem] text-highlight-muted-foreground">
          Removed from the server before? This invite won&apos;t let you back in; the staff can help.
        </p>
      </div>
    </aside>
  );
}
