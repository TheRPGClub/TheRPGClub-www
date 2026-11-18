import { cache } from "react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  GameAchievementSet,
  GameRelations,
  Release,
  Review,
  UserSummary,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import { memberName } from "@/lib/achievements";
import { getSession, requireFeature } from "@/lib/session";
import { isAdminOrAbove, isMemberOrStaff, isRegularOrStaff } from "@/lib/staff";

// The game page's reads. The page itself only gates and fills the detail
// template; its sections stream their own reads from here.

// The page reads enough reviews to know whether the viewer already wrote one,
// and shows the first few as the crew strip.
export const REVIEWS_READ = 5;
export const REVIEWS_SHOWN = 3;

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// The game, the session, the viewer's Features and the first reviews. Null
// when the game can't be read (the page is then a 404). The game and the
// session don't wait on the viewer's Features; only the Reviews read does.
export async function loadGamePage(gameId: number) {
  const featuresRead = requireFeature("game_index");
  const [gameRes, session, features, reviewsRes] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`),
    getSession(),
    featuresRead,
    featuresRead.then((f) =>
      f.shown("reviews")
        ? apiFetch(`/api/v1/games/${gameId}/reviews?per=${REVIEWS_READ}`, {
            cache: "no-store",
          })
        : null,
    ),
  ]);
  if (!gameRes.ok) return null;
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let reviews: Review[] = [];
  let reviewTotal: number | null = null;
  if (reviewsRes?.ok) {
    const body: ApiCollection<Review> = await reviewsRes.json();
    reviews = body.data;
    reviewTotal = paginationOf(body.meta, reviews.length).total;
  }
  // The page's sections from other Features, each left out when this viewer
  // isn't shown it (flag or preference).
  const show = {
    ballot: features.shown("voting_gotm"),
    playing: features.shown("now_playing"),
    completed: features.shown("game_completions"),
    reviews: features.shown("reviews"),
    journals: features.shown("journals"),
    achievements: features.shown("achievement_hub"),
    // The Releases section always shows (it is the game index's); only its
    // link to the Release Calendar follows that Feature.
    releaseCalendar: features.shown("release_calendar"),
  };
  return { game, session, features, show, reviews, reviewTotal };
}

export type GamePageShow = NonNullable<Awaited<ReturnType<typeof loadGamePage>>>["show"];

// What the viewer may do on the game page, by their membership.
export function gamePageGates(
  game: Pick<Game, "igdb_id">,
  membership: Parameters<typeof isAdminOrAbove>[0],
) {
  return {
    // Image upload and linking versions.
    isAdmin: isAdminOrAbove(membership),
    // Thread link and unlink: the API's Regulars-or-staff gate.
    canEditThreads: isRegularOrStaff(membership),
    // Refresh release info needs an IGDB link and the API's member gate.
    canRefreshReleases: game.igdb_id != null && isMemberOrStaff(membership),
  };
}

export type GamePageGates = ReturnType<typeof gamePageGates>;

export function formatReleaseDate(date: string, month: "short" | "long"): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
  });
}

// Read once per request: the details rail and the alternate versions both
// come out of it, and stream separately.
export const fetchGameRelations = cache(
  async (gameId: number): Promise<GameRelations | null> => {
    const res = await apiFetch(`/api/v1/games/${gameId}/relations`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSingle<GameRelations>).data;
  },
);

// The game's Releases in Release Calendar placement order, or null when the
// read fails. Never cached, so the section shows a refresh's result at once.
export async function fetchGameReleases(gameId: number): Promise<Release[] | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/releases`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { data?: Release[] }).data ?? [];
  } catch {
    return null;
  }
}

// The game's Achievement Sets, or null when the read fails.
export async function fetchGameAchievementSets(
  gameId: number,
): Promise<GameAchievementSet[] | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/achievement_sets`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: { data?: GameAchievementSet[] } = await res.json();
    return (body.data ?? []).map((set) => ({
      ...set,
      achievements: set.achievements ?? [],
    }));
  } catch {
    return null;
  }
}

// user_id -> display name for the ring's members, from the cached member
// directory. Empty when it can't be read: names then fall back to the
// Completions' users.
export async function fetchRingMemberNames(): Promise<Map<string, string>> {
  try {
    const res = await apiFetch(`/api/v1/users?per=500`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    });
    if (!res.ok) return new Map();
    const { data }: ApiCollection<UserSummary> = await res.json();
    return new Map(data.map((user) => [user.user_id, memberName(user)]));
  } catch {
    return new Map();
  }
}
