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

// For surfaces that only need the numbers. null when the game read failed.
export async function fetchGameCounts(
  gameId: number,
): Promise<GameCounts | null> {
  try {
    const [gameRes, reviewsRes] = await Promise.all([
      apiFetch(`/api/v1/games/${gameId}`, COUNTS_FETCH),
      apiFetch(`/api/v1/games/${gameId}/reviews?per=1`, COUNTS_FETCH),
    ]);
    if (!gameRes.ok) return null;
    const { data: game }: ApiSingle<Game> = await gameRes.json();
    let reviewTotal: number | null = null;
    if (reviewsRes.ok) {
      const body: ApiCollection<Review> = await reviewsRes.json();
      reviewTotal = paginationOf(body.meta, body.data.length).total;
    }
    return countsOf(game, reviewTotal);
  } catch {
    return null;
  }
}
