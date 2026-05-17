import { Suspense } from "react";
import { Trophy, Gamepad2, type LucideIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  DashboardResponse,
  Game,
  GotmEntry,
  NrGotmEntry,
} from "@/lib/api/types";
import { GotmCard, gotmCardProps } from "@/components/gotm-card";
import { GameImageUploadForm } from "@/components/game-image-upload-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession, type SessionPrincipal } from "@/lib/session";

type Pick<T extends GotmEntry | NrGotmEntry = GotmEntry | NrGotmEntry> = {
  entry: T;
  game: Game | null;
};

type Round<T extends GotmEntry | NrGotmEntry> = {
  month_year: string;
  round_number: number;
  picks: Pick<T>[];
};

const DASHBOARD_REVALIDATE_SECONDS = 300;

async function fetchDashboard(): Promise<DashboardResponse | null> {
  try {
    const res = await apiFetch("/api/v1/dashboard?limit=10", {
      next: {
        revalidate: DASHBOARD_REVALIDATE_SECONDS,
        tags: ["dashboard", "games"],
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as DashboardResponse;
  } catch {
    return null;
  }
}

function currentRound<T extends GotmEntry | NrGotmEntry>(
  entries: T[] | undefined,
): Round<T> | null {
  if (!entries?.length) return null;

  const round_number = entries[0].round_number;
  const picks = entries
    .filter((e) => e.round_number === round_number)
    .map((entry) => ({ entry, game: entry.game ?? null }))
    .sort((a, b) => a.entry.game_index - b.entry.game_index);

  return {
    month_year: entries[0].month_year,
    round_number,
    picks,
  };
}

const gridClass: Record<number, string> = {
  1: "",
  2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  3: "grid grid-cols-1 sm:grid-cols-3 gap-4",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const [dashboard, session] = await Promise.all([
    fetchDashboard(),
    getSession(),
  ]);

  const gotm = currentRound<GotmEntry>(dashboard?.data.gotm);
  const nrGotm = currentRound<NrGotmEntry>(dashboard?.data.nr_gotm);

  const uploadPicks = gotm
    ? uniqueGamePicks([...gotm.picks, ...(nrGotm?.picks ?? [])])
    : [];

  return (
    <div className="space-y-8">
      {session && <DashboardWelcome principal={session.principal} />}

      {!gotm || !gotm.picks.length ? (
        <p className="text-muted-foreground">No current Game of the Month.</p>
      ) : (
        <>
          <section className="space-y-3">
            <SectionHeader
              title="Game of the Month"
              round={gotm.round_number}
              monthYear={gotm.month_year}
              pickCount={gotm.picks.length}
              accent="emerald"
              Icon={Trophy}
            />
            <div className={gridClass[gotm.picks.length] ?? gridClass[3]}>
              {gotm.picks.map((pick, i) => {
                const isCompact = gotm.picks.length >= 3;
                return (
                  <GotmCard
                    key={pick.entry.gamedb_game_id ?? i}
                    label={isCompact ? "GOTM" : "Game of the Month"}
                    round={gotm.round_number}
                    monthYear={gotm.month_year}
                    accent="emerald"
                    compact={isCompact}
                    showMeta={false}
                    href={
                      pick.entry.gamedb_game_id
                        ? `/games/${pick.entry.gamedb_game_id}`
                        : undefined
                    }
                    {...gotmCardProps(pick.game, pick.entry.game_title)}
                  />
                );
              })}
            </div>
          </section>

          {nrGotm && nrGotm.picks.length > 0 && (
            <section className="space-y-3">
              <SectionHeader
                title="Non-RPG Game of the Month"
                round={nrGotm.round_number}
                monthYear={nrGotm.month_year}
                pickCount={nrGotm.picks.length}
                accent="purple"
                Icon={Gamepad2}
              />
              <div className={gridClass[nrGotm.picks.length] ?? gridClass[3]}>
                {nrGotm.picks.map((pick, i) => {
                  const isCompact = nrGotm.picks.length >= 3;
                  const cardProps = gotmCardProps(
                    pick.game,
                    pick.entry.game_title,
                  );
                  return (
                    <GotmCard
                      key={pick.entry.gamedb_game_id ?? i}
                      label={
                        isCompact ? "NR GOTM" : "Non RPG Game of the Month"
                      }
                      round={nrGotm.round_number}
                      monthYear={nrGotm.month_year}
                      accent="purple"
                      compact={isCompact}
                      showMeta={false}
                      imageAlign="left"
                      href={
                        pick.entry.gamedb_game_id
                          ? `/games/${pick.entry.gamedb_game_id}`
                          : undefined
                      }
                      {...cardProps}
                      description={
                        nrGotm.picks.length > 1 ? null : cardProps.description
                      }
                    />
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function DashboardWelcome({ principal }: { principal: SessionPrincipal }) {
  const displayName = principal.global_name ?? principal.username;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Welcome back,{" "}
        <span className="bg-linear-to-r from-emerald-200 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
          {displayName}
        </span>
        <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
          .
        </span>
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening at the club.
      </p>
    </div>
  );
}

const sectionAccent = {
  emerald: {
    icon: "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    gradient: "from-emerald-200 via-emerald-300 to-emerald-500",
    underline: "from-emerald-500/60 via-emerald-500/20 to-transparent",
  },
  purple: {
    icon: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    gradient: "from-purple-200 via-purple-300 to-purple-500",
    underline: "from-purple-500/60 via-purple-500/20 to-transparent",
  },
} as const;

function SectionHeader({
  title,
  round,
  monthYear,
  pickCount,
  accent,
  Icon,
}: {
  title: string;
  round: number;
  monthYear: string;
  pickCount: number;
  accent: keyof typeof sectionAccent;
  Icon: LucideIcon;
}) {
  const style = sectionAccent[accent];
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${style.icon}`} strokeWidth={1.75} />
          <h2
            className={`bg-linear-to-r ${style.gradient} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl`}
          >
            {title}
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Round {round} · {monthYear}
          {pickCount > 1 && ` · ${pickCount} winners`}
        </p>
      </div>
      <div className={`h-px w-full bg-linear-to-r ${style.underline}`} />
    </header>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <DashboardCardSkeleton />
      </div>

      <div>
        <DashboardCardSkeleton imageAlign="left" />
      </div>
    </div>
  );
}

function DashboardCardSkeleton({
  imageAlign = "right",
}: {
  imageAlign?: "left" | "right";
}) {
  const left = imageAlign === "left";

  return (
    <div className="relative min-h-56 overflow-hidden rounded-xl border bg-card">
      <Skeleton
        className={`absolute top-0 h-full w-[70%] rounded-none ${
          left ? "left-0" : "right-0"
        }`}
      />
      <div
        className={`relative max-w-[30%] space-y-3 p-6 ${left ? "ml-auto" : ""}`}
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-5/6" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function uniqueGamePicks(picks: Pick[]) {
  const seen = new Set<number>();
  return picks.filter((pick) => {
    const gameId = pick.entry.gamedb_game_id;
    if (!gameId || seen.has(gameId)) return false;

    seen.add(gameId);
    return true;
  });
}
