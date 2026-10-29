import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { fetchPublicWinners } from "@/lib/api/public-winners";
import type { PublicWinner, VotingCategory } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import { firstParam } from "@/lib/search-params";
import { buttonVariants } from "@/components/ui/button";
import { LandingCover, LandingPitch } from "@/components/issue/landing-cover";
import {
  LandingMarquee,
  type LandingMarqueeItem,
} from "@/components/issue/landing-marquee";
import { cn } from "@/lib/utils";

// The front page: the club pitched as its own magazine, for everyone. The
// recent winners are public club content (GET /api/v1/public/winners), so a
// logged-out visit gets this round's Game of the Month as the cover, the two
// tracks' latest picks and the winners marquee. When that read fails or comes
// back empty, the page describes the club in plain words only: flat track
// panels for a cover, no shelves, no marquee.

type HomeProps = {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

const SHELF_SIZE = 5;

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const token = firstParam(params?.token);

  if (token) {
    redirect(`/auth/callback?token=${encodeURIComponent(token)}`);
  }

  const [session, winners] = await Promise.all([
    getSession(),
    fetchPublicWinners(),
  ]);
  const signInHref = `${process.env.API_URL ?? "http://localhost:3000"}/auth/discord`;
  const profileHref = session
    ? `/members/${session.principal.discord_id}`
    : null;

  // Newest round first, and GOTM before NR-GOTM in `game_index` order within
  // a round, so the first GOTM of the latest round is its lead.
  const latest = winners[0] ?? null;
  const lead = latest
    ? (winners.find(
        (w) => w.round_number === latest.round_number && w.kind === "gotm",
      ) ?? null)
    : null;

  return (
    <div className="flex min-h-svh flex-col bg-ink text-paper">
      <main className="flex-1">
        {lead && latest ? (
          <LandingCover
            lead={lead}
            issueNumber={latest.round_number}
            signInHref={signInHref}
            profileHref={profileHref}
          />
        ) : (
          <FlatHero signInHref={signInHref} profileHref={profileHref} />
        )}
        <HowItWorks />
        <TwoTracks winners={winners} />
        <YourShelf />
        <Close signInHref={signInHref} />
        <LandingMarquee items={marqueeItems(winners)} />
      </main>

      <footer className="flex items-center gap-3 border-t border-rule px-4 py-5 text-[0.8rem] text-paper-mute sm:px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={26} height={26} className="size-6.5" />
        The RPG Club · a Discord community
      </footer>
    </div>
  );
}

// --- Fallback hero -------------------------------------------------------------

// Without winners to put on the cover: the pitch beside the two tracks as
// flat colour plates that describe them.
function FlatHero({
  signInHref,
  profileHref,
}: {
  signInHref: string;
  profileHref: string | null;
}) {
  return (
    <section className="grid gap-10 px-4 pt-24 pb-12 sm:px-10 sm:pt-28 sm:pb-16 lg:min-h-[52rem] lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end lg:gap-14">
      <LandingPitch signInHref={signInHref} profileHref={profileHref} />
      <div className="grid gap-2.5">
        <Plate
          kind="gotm"
          name="Game of the Month"
          blurb="An RPG, nominated and voted in by the club, played through the month."
        />
        <Plate
          kind="nr_gotm"
          name="Non-RPG Game of the Month"
          blurb="The wildcard: roguelikes, farming sims, metroidvanias, anything that isn't an RPG."
        />
      </div>
    </section>
  );
}

function Plate({
  kind,
  name,
  blurb,
}: {
  kind: VotingCategory;
  name: string;
  blurb: string;
}) {
  return (
    <section
      className={cn(
        "rounded-md px-5 pt-4.5 pb-5 text-white",
        kind === "gotm" ? "bg-gotm" : "bg-nr",
      )}
    >
      <h2 className="font-headline max-w-[11ch] text-[2.4rem] leading-[0.9] sm:text-[2.75rem]">
        {name}
      </h2>
      <p className="mt-2.5 max-w-[34ch] text-[0.92rem] font-medium text-white/85">
        {blurb}
      </p>
    </section>
  );
}

// --- Sections ----------------------------------------------------------------

function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-headline border-b-2 border-paper pb-3 text-[2.15rem] sm:text-[2.9rem]"
    >
      {children}
    </h2>
  );
}

const STEPS = [
  {
    title: "Nominate",
    body: "Members put forward the RPG and the non-RPG they want the club to play next, with a line on why.",
  },
  {
    title: "Vote",
    body: "The nominations become the ballot. Everyone gets a few votes per track, and the tally decides the winners.",
  },
  {
    title: "Play together",
    body: "The winners are the month's Game of the Month and Non-RPG Game of the Month, each with a Discord thread to talk about them.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="scroll-mt-6 border-t border-rule px-4 py-12 sm:px-10 sm:py-18"
    >
      <SectionTitle id="how-title">How an issue comes together</SectionTitle>
      <ol className="mt-8 grid gap-9 md:grid-cols-3 md:gap-7">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span
              aria-hidden
              className="font-headline block text-[5.25rem] leading-[0.8] text-ink-3 [-webkit-text-stroke:1.5px_var(--color-paper-mute)] sm:text-[7.5rem]"
            >
              {i + 1}
            </span>
            <h3 className="font-headline mt-3.5 text-[2.25rem] leading-[0.95]">
              {step.title}
            </h3>
            <p className="mt-2.5 max-w-[38ch] text-paper-dim">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TwoTracks({ winners }: { winners: PublicWinner[] }) {
  // Each round's lead pick per track, newest first.
  const shelf = (kind: VotingCategory) => {
    const seen = new Set<number>();
    return winners
      .filter((w) => {
        if (w.kind !== kind || seen.has(w.round_number)) return false;
        seen.add(w.round_number);
        return true;
      })
      .slice(0, SHELF_SIZE);
  };

  return (
    <section
      aria-labelledby="tracks-title"
      className="border-t border-rule px-4 py-12 sm:px-10 sm:py-18"
    >
      <SectionTitle id="tracks-title">Two tracks, every month</SectionTitle>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-7">
        <Track
          kind="gotm"
          name="Game of the Month"
          body="The club's main event: an RPG, chosen by vote, played by the club through the month."
          picks={shelf("gotm")}
        />
        <Track
          kind="nr_gotm"
          name="Non-RPG Game of the Month"
          body="The second track, for everything else: roguelikes, farming sims, metroidvanias, whatever the club fancies."
          picks={shelf("nr_gotm")}
        />
      </div>
    </section>
  );
}

function Track({
  kind,
  name,
  body,
  picks,
}: {
  kind: VotingCategory;
  name: string;
  body: string;
  picks: PublicWinner[];
}) {
  const gotm = kind === "gotm";
  return (
    <div className={cn("border-t-6 pt-4.5", gotm ? "border-gotm" : "border-nr")}>
      <h3
        className={cn(
          "font-headline text-[2.25rem] leading-[0.95] sm:text-[2.6rem]",
          gotm ? "text-gotm" : "text-nr-soft",
        )}
      >
        {name}
      </h3>
      <p className="mt-2.5 max-w-[52ch] text-paper-dim">{body}</p>
      {picks.length > 0 && (
        <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {picks.map((pick, i) => (
            <li key={pick.round_number} className={cn(i >= 3 && "max-sm:hidden")}>
              <div
                className={cn(
                  "aspect-[3/4] overflow-hidden border-b-4 bg-ink-3",
                  gotm ? "border-gotm" : "border-nr",
                )}
              >
                {pick.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pick.cover_url}
                    alt={pick.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-headline grid size-full place-items-center p-2 text-center text-lg text-paper-mute">
                    {pick.title}
                  </span>
                )}
              </div>
              <p className="font-label mt-1.5 text-[0.78rem] font-extrabold tracking-[0.08em] text-paper-mute">
                Round {pick.round_number}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SHELF = [
  ["Now playing", "Tell the club what you're on, with the platform and a note."],
  ["Completed", "Log finishes, compare completions with another member, and export them."],
  ["Backlog", "Keep a list, then let the backlog picker choose your next game, with HowLongToBeat times."],
  ["Collection", "Import what you own from Steam or a CSV, or bring completions over from Completionator."],
  ["Reviews", "Write reviews with a rating and a scorecard, and read what the club thought."],
] as const;

function YourShelf() {
  return (
    <section
      aria-labelledby="shelf-title"
      className="border-t border-rule px-4 py-12 sm:px-10 sm:py-18"
    >
      <SectionTitle id="shelf-title">Your shelf in the club</SectionTitle>
      <dl className="mt-4 grid gap-x-12 lg:grid-cols-2">
        {SHELF.map(([title, body]) => (
          <div
            key={title}
            className="grid gap-1 border-b border-rule py-4.5 sm:grid-cols-[11rem_1fr] sm:gap-5"
          >
            <dt className="font-headline text-[1.6rem] leading-none">{title}</dt>
            <dd className="text-paper-dim">{body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Close({ signInHref }: { signInHref: string }) {
  return (
    <section className="grid gap-7 bg-highlight px-4 py-11 text-ink sm:px-10 sm:py-16 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <h2 className="font-headline text-[3.4rem] leading-[0.86] sm:text-[5.25rem]">
          Pull up
          <br />a chair.
        </h2>
        <p className="mt-3.5 max-w-[52ch] font-medium text-highlight-ink">
          Sign in with your Discord account to join the round, vote on the
          ballot and start your shelf.
        </p>
      </div>
      <a
        href={signInHref}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-13 bg-ink px-6 text-lg text-paper hover:bg-ink/85",
        )}
      >
        Sign in with Discord
        <ArrowRight data-icon="inline-end" />
      </a>
    </section>
  );
}

// Every Game of the Month in the public window, newest first.
function marqueeItems(winners: PublicWinner[]): LandingMarqueeItem[] {
  return winners
    .filter((w) => w.kind === "gotm")
    .map((w) => ({
      key: `${w.round_number}-${w.game_id}`,
      title: w.title,
      coverUrl: w.cover_url,
      roundNumber: w.round_number,
    }));
}
