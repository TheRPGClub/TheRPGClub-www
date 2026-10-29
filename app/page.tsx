import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, UserRound } from "lucide-react";
import {
  fetchCurrentGotmRound,
  fetchGotmRounds,
} from "@/lib/api/gotm-rounds";
import type { GotmRound, GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import { firstParam } from "@/lib/search-params";
import { buttonVariants } from "@/components/ui/button";
import { Starburst } from "@/components/issue/starburst";
import {
  LandingMarquee,
  type LandingMarqueeItem,
} from "@/components/issue/landing-marquee";
import { cn } from "@/lib/utils";

// The logged-out front page: the club pitched as its own magazine. Every
// GOTM read needs a session (the API has no public round endpoint), so a
// visitor who isn't signed in sees the club described in plain words only:
// no current round, no winners, no counts. A signed-in visitor gets the same
// page dressed with the real current issue and the winners marquee.

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

  const session = await getSession();
  const signInHref = `${process.env.API_URL ?? "http://localhost:3000"}/auth/discord`;
  const profileHref = session
    ? `/members/${session.principal.discord_id}`
    : null;

  const [current, history] = session
    ? await Promise.all([
        fetchCurrentGotmRound(),
        fetchGotmRounds({
          kind: "both",
          year: null,
          q: "",
          sort: "desc",
          page: 1,
        }),
      ])
    : [null, null];
  const rounds = history?.rounds ?? [];
  const lead = current?.gotm?.games.length
    ? leadWinner(current.gotm.games)
    : null;
  const leadArt = lead?.game?.art_url ?? null;
  const issue = current
    ? {
        roundNumber: current.round_number,
        monthYear:
          current.gotm?.month_year ?? current.nr_gotm?.month_year ?? null,
      }
    : null;

  return (
    <div className="flex min-h-svh flex-col bg-ink text-paper">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-3.5 px-4 py-3.5 sm:px-10 sm:py-4.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="The RPG Club"
          width={44}
          height={44}
          className="size-9 sm:size-11"
        />
        {issue && (
          <p className="font-label hidden text-sm font-extrabold tracking-[0.1em] text-paper-dim [text-shadow:0_1px_8px_rgb(0_0_0/0.85)] sm:block">
            <span className="text-paper">Issue {issue.roundNumber}</span>
            {issue.monthYear && (
              <>
                <span aria-hidden className="mx-2 text-gotm">
                  /
                </span>
                {issue.monthYear}
              </>
            )}
          </p>
        )}
        <div className="ml-auto flex items-center gap-2">
          {profileHref ? (
            <Link
              href={profileHref}
              className={buttonVariants({ variant: "outline" })}
            >
              <UserRound data-icon="inline-start" />
              My Profile
            </Link>
          ) : (
            <a href={signInHref} className={buttonVariants({ variant: "outline" })}>
              Sign in
            </a>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Hero
          signInHref={signInHref}
          profileHref={profileHref}
          art={leadArt}
          lead={lead}
          nrLead={
            current?.nr_gotm?.games.length
              ? leadWinner(current.nr_gotm.games)
              : null
          }
        />
        <HowItWorks />
        <TwoTracks rounds={rounds} />
        <YourShelf />
        <Close signInHref={signInHref} />
        <LandingMarquee items={marqueeItems(rounds)} />
      </main>

      <footer className="flex items-center gap-3 border-t border-rule px-4 py-5 text-[0.8rem] text-paper-mute sm:px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={26} height={26} className="size-6.5" />
        The RPG Club · a Discord community
      </footer>
    </div>
  );
}

function leadWinner(games: GotmRoundGame[]): GotmRoundGame {
  return [...games].sort((a, b) => a.game_index - b.game_index)[0];
}

// --- Hero --------------------------------------------------------------------

function Hero({
  signInHref,
  profileHref,
  art,
  lead,
  nrLead,
}: {
  signInHref: string;
  profileHref: string | null;
  art: string | null;
  lead: GotmRoundGame | null;
  nrLead: GotmRoundGame | null;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      {art && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art}
            alt=""
            className="absolute inset-0 -z-20 size-full object-cover object-[62%_30%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(11_11_13/0.97)_0%,rgb(11_11_13/0.86)_40%,rgb(11_11_13/0.25)_75%,rgb(11_11_13/0.45)_100%),linear-gradient(0deg,rgb(11_11_13)_0%,transparent_34%),linear-gradient(180deg,rgb(11_11_13/0.7)_0%,transparent_22%)]"
          />
        </>
      )}

      <div className="grid gap-10 px-4 pt-24 pb-12 sm:px-10 sm:pt-28 sm:pb-16 lg:min-h-[52rem] lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end lg:gap-14">
        <div className="flex flex-col">
          <p
            aria-hidden
            className="font-headline text-[5.6rem] leading-[0.8] tracking-[-0.01em] sm:text-[8rem] xl:text-[9.75rem]"
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
          <p className="mt-5 max-w-[52ch] text-[1.05rem] text-paper-dim">
            The RPG Club is a Discord community that votes on a Game of the
            Month and plays it together, with a second pick for everything
            that isn&apos;t an RPG. This site is the club&apos;s hub: the
            current round, the ballot, every past winner, and every
            member&apos;s shelf.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <a
              href={signInHref}
              className={cn(
                buttonVariants({ variant: "highlight", size: "lg" }),
                "h-13 px-6 text-lg",
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
                  "h-13 px-6 text-lg",
                )}
              >
                My Profile
              </Link>
            ) : (
              <a
                href="#how"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-13 px-6 text-lg",
                )}
              >
                How the club works
              </a>
            )}
          </div>
        </div>

        <TrackPlates lead={lead} nrLead={nrLead} />
      </div>
    </section>
  );
}

// The two tracks as cover plates beside the masthead. They describe the
// tracks; only a signed-in read puts this month's actual winners on them.
function TrackPlates({
  lead,
  nrLead,
}: {
  lead: GotmRoundGame | null;
  nrLead: GotmRoundGame | null;
}) {
  return (
    <div className="relative grid gap-2.5">
      <Plate
        kind="gotm"
        name="Game of the Month"
        blurb="An RPG, nominated and voted in by the club, played through the month."
        winner={lead}
      />
      <Plate
        kind="nr_gotm"
        name="Non-RPG Game of the Month"
        blurb="The wildcard: roguelikes, farming sims, metroidvanias, anything that isn't an RPG."
        winner={nrLead}
      />
    </div>
  );
}

function Plate({
  kind,
  name,
  blurb,
  winner,
}: {
  kind: VotingCategory;
  name: string;
  blurb: string;
  winner: GotmRoundGame | null;
}) {
  const title = winner?.game?.title;
  const gotm = kind === "gotm";
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-md px-5 pt-4.5 pb-5 text-white",
        gotm ? "bg-gotm" : "bg-nr",
      )}
    >
      {title && gotm && (
        <Starburst
          track="gotm"
          className="absolute top-3 right-3 size-22"
          textClassName="text-[0.78rem]"
        />
      )}
      <h2 className="font-headline max-w-[11ch] text-[2.4rem] leading-[0.9] sm:text-[2.75rem]">
        {name}
      </h2>
      <p className="mt-2.5 max-w-[34ch] text-[0.92rem] font-medium text-white/85">
        {blurb}
      </p>
      {title && (
        <p className="font-label mt-3.5 border-t border-white/30 pt-2.5 text-[0.95rem] font-extrabold tracking-[0.04em]">
          This month the club plays{" "}
          <span className="font-headline block pt-1 text-[1.6rem] leading-[0.95] tracking-normal">
            {title}
          </span>
        </p>
      )}
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

function TwoTracks({ rounds }: { rounds: GotmRound[] }) {
  const shelf = (kind: VotingCategory) =>
    rounds
      .flatMap((round) => {
        const block = kind === "gotm" ? round.gotm : round.nr_gotm;
        const entry = block?.games.length ? leadWinner(block.games) : null;
        return entry ? [{ round: round.round_number, entry }] : [];
      })
      .slice(0, SHELF_SIZE);

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
  picks: { round: number; entry: GotmRoundGame }[];
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
          {picks.map(({ round, entry }, i) => {
            const title = entry.game?.title ?? "Unknown game";
            const cover = entry.game?.cover_url ?? null;
            return (
              <li key={round} className={cn(i >= 3 && "max-sm:hidden")}>
                <div
                  className={cn(
                    "aspect-[3/4] overflow-hidden border-b-4 bg-ink-3",
                    gotm ? "border-gotm" : "border-nr",
                  )}
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={title} className="size-full object-cover" />
                  ) : (
                    <span className="font-headline grid size-full place-items-center p-2 text-center text-lg text-paper-mute">
                      {title}
                    </span>
                  )}
                </div>
                <p className="font-label mt-1.5 text-[0.78rem] font-extrabold tracking-[0.08em] text-paper-mute">
                  Round {round}
                </p>
              </li>
            );
          })}
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

function marqueeItems(rounds: GotmRound[]): LandingMarqueeItem[] {
  return rounds.flatMap((round) =>
    [...(round.gotm?.games ?? [])]
      .sort((a, b) => a.game_index - b.game_index)
      .map((entry, i) => ({
        key: `${round.round_number}-${entry.gamedb_game_id ?? i}`,
        title: entry.game?.title ?? "Unknown game",
        coverUrl: entry.game?.cover_url ?? null,
        roundNumber: round.round_number,
      })),
  );
}
