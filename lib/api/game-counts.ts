import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type { ApiCollection, ApiSingle, Game, Review, User } from "@/lib/api/types";
import type { FeatureView } from "@/lib/features";

// The club's Playing / Completed / Reviews numbers for a game: the game page
// shows them in its hero, the dashboard on each winner's cover. Players and
// completers are counted once per member, however many entries they have.

export interface GameCounts {
  // Each is null when its Feature (Now Playing, Game Completions, Reviews)
  // isn't shown to the viewer, or, for reviews, when the read failed:
  // unknown, not zero.
  playing: number | null;
  completed: number | null;
  reviews: number | null;
}

// Leaves out the numbers whose Feature the viewer isn't shown.
export function shownCounts(counts: GameCounts, features: FeatureView): GameCounts {
  return {
    playing: features.shown("now_playing") ? counts.playing : null,
    completed: features.shown("game_completions") ? counts.completed : null,
    reviews: features.shown("reviews") ? counts.reviews : null,
  };
}

// One known number, for a surface to label in its own voice.
export interface CountStat {
  key: keyof GameCounts;
  value: number;
}

// The known numbers in the order every surface shows them (Playing,
// Completed, Reviews). Empty when none is known: show no stats at all.
export function countStats(counts: GameCounts): CountStat[] {
  return (["playing", "completed", "reviews"] as const).flatMap((key) => {
    const value = counts[key];
    return value == null ? [] : [{ key, value }];
  });
}

// A stat's label in the dashboard covers' lowercase caption voice.
export function coverStatLabel({ key, value }: CountStat): string {
  if (key === "playing") return "playing";
  if (key === "completed") return "cleared";
  return value === 1 ? "review" : "reviews";
}

export function uniqueUsers(
  entries: { user_id: string; user?: User | null }[],
): User[] {
  const seen = new Set<string>();
  return entries.flatMap((e) => {
    if (!e.user || seen.has(e.user_id)) return [];
    seen.add(e.user_id);
    return [e.user];
  });
}

export function countsOf(game: Game, reviewTotal: number | null): GameCounts {
  return {
    playing: uniqueUsers(game.now_playing ?? []).length,
    completed: uniqueUsers(game.completions ?? []).length,
    reviews: reviewTotal,
  };
}

const COUNTS_FETCH: RequestInit = { next: { revalidate: 300 } };

// For surfaces that only need the numbers: reads only what the viewer is
// shown (the game for Playing / Completed, its reviews for Reviews) and
// returns just those. null when the game read failed or nothing is shown.
export async function fetchGameCounts(
  gameId: number,
  features: FeatureView,
): Promise<GameCounts | null> {
  const wantGame =
    features.shown("now_playing") || features.shown("game_completions");
  const wantReviews = features.shown("reviews");
  if (!wantGame && !wantReviews) return null;
  try {
    const [gameRes, reviewsRes] = await Promise.all([
      wantGame ? apiFetch(`/api/v1/games/${gameId}`, COUNTS_FETCH) : null,
      wantReviews
        ? apiFetch(`/api/v1/games/${gameId}/reviews?per=1`, COUNTS_FETCH)
        : null,
    ]);
    if (gameRes && !gameRes.ok) return null;
    const game: Game | null = gameRes
      ? ((await gameRes.json()) as ApiSingle<Game>).data
      : null;
    let reviewTotal: number | null = null;
    if (reviewsRes?.ok) {
      const body: ApiCollection<Review> = await reviewsRes.json();
      reviewTotal = paginationOf(body.meta, body.data.length).total;
    }
    const counts = game
      ? countsOf(game, reviewTotal)
      : { playing: null, completed: null, reviews: reviewTotal };
    return shownCounts(counts, features);
  } catch {
    return null;
  }
}
