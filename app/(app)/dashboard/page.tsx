import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  Game,
  GotmEntry,
  NrGotmEntry,
} from "@/lib/api/types";
import { GotmCard, gotmCardProps } from "@/components/gotm-card";
import { GameImageUploadForm } from "@/components/game-image-upload-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

type Pick<T extends GotmEntry | NrGotmEntry = GotmEntry | NrGotmEntry> = {
  entry: T;
  game: Game | null;
};

const DASHBOARD_REVALIDATE_SECONDS = 300;

async function fetchCurrentRound<T extends GotmEntry | NrGotmEntry>(
  endpoint: string,
): Promise<{ month_year: string; picks: Pick<T>[] } | null> {
  try {
    const res = await apiFetch(endpoint, {
      next: { revalidate: DASHBOARD_REVALIDATE_SECONDS, tags: ["dashboard", "games"] },
    });
    if (!res.ok) return null;
    const { data: entries }: ApiCollection<T> = await res.json();
    if (!entries.length) return null;

    const currentRound = entries[0].round_number;
    const currentEntries = entries.filter(
      (e) => e.round_number === currentRound,
    );

    const picks = currentEntries.map((entry) => ({
      entry,
      game: entry.game ?? null,
    }));

    return {
      month_year: entries[0].month_year,
      picks: picks.sort((a, b) => a.entry.game_index - b.entry.game_index),
    };
  } catch {
    return null;
  }
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
  const [gotm, nrGotm, session] = await Promise.all([
    fetchCurrentRound<GotmEntry>("/api/v1/gotm_entries?limit=10&include=game"),
    fetchCurrentRound<NrGotmEntry>("/api/v1/nr_gotm_entries?limit=10&include=game"),
    getSession(),
  ]);

  if (!gotm || !gotm.picks.length) {
    return (
      <p className="text-muted-foreground">No current Game of the Month.</p>
    );
  }

  const canManageImages = session?.membership?.admin ?? false;
  const uploadPicks = uniqueGamePicks([
    ...gotm.picks,
    ...(nrGotm?.picks ?? []),
  ]);

  return (
    <div className="space-y-4">
      <div className={gridClass[gotm.picks.length] ?? gridClass[3]}>
        {gotm.picks.map((pick, i) => (
          <GotmCard
            key={pick.entry.gamedb_game_id ?? i}
            label={`Game of the Month · ${gotm.month_year}`}
            href={
              pick.entry.gamedb_game_id
                ? `/games/${pick.entry.gamedb_game_id}`
                : undefined
            }
            {...gotmCardProps(pick.game, pick.entry.game_title)}
          />
        ))}
      </div>

      {nrGotm && nrGotm.picks.length > 0 && (
        <div className={gridClass[nrGotm.picks.length] ?? gridClass[3]}>
          {nrGotm.picks.map((pick, i) => {
            const cardProps = gotmCardProps(pick.game, pick.entry.game_title);
            return (
              <GotmCard
                key={pick.entry.gamedb_game_id ?? i}
                label={`Non RPG GAME OF THE MONTH · ${nrGotm.month_year}`}
                imageAlign="left"
                href={
                  pick.entry.gamedb_game_id
                    ? `/games/${pick.entry.gamedb_game_id}`
                    : undefined
                }
                {...cardProps}
                description={nrGotm.picks.length > 1 ? null : cardProps.description}
              />
            );
          })}
        </div>
      )}

      {canManageImages && uploadPicks.length > 0 && (
        <section className="space-y-2 pt-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Game Images
          </h2>
          <div className="space-y-2">
            {uploadPicks.map((pick) => (
              <div
                key={pick.entry.gamedb_game_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-52">
                  <p className="text-sm font-medium">
                    {pick.game?.title ?? pick.entry.game_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{pick.entry.gamedb_game_id}
                  </p>
                </div>
                <GameImageUploadForm gameId={pick.entry.gamedb_game_id!} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
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
      <div className={`relative max-w-[30%] space-y-3 p-6 ${left ? "ml-auto" : ""}`}>
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
