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
  Thread,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import { memberName } from "@/lib/achievements";
import { draftOfGame } from "@/lib/reviews/drafts";
import { fetchOwnDrafts } from "@/lib/reviews/drafts-read";
import { getSession, requireFeature } from "@/lib/session";
import { gameEditViewer } from "@/lib/games/game-edit/tabs";
import { fetchMemberDirectory } from "@/lib/api/shared";

// The game page's reads. The page itself only gates and fills the detail
// template; its sections stream their own reads from here.

// The page reads enough reviews to know whether the viewer already wrote one,
// and shows the first few as the crew strip.
export const REVIEWS_READ = 5;
export const REVIEWS_SHOWN = 3;

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// The game, the session and the viewer's Features, read side by side. Null
// when the game can't be read (the page is then a 404). The Reviews section
// reads its own (loadGameReviews) and streams in, so it never holds up the
// rest of the page.
export async function loadGamePage(gameId: number) {
  const [gameRes, session, features] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`),
    getSession(),
    requireFeature("game_index"),
  ]);
  if (!gameRes.ok) return null;
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  // The page's sections from other Features, each left out when this viewer
  // isn't shown it (flag or preference).
  const show = {
    ballot: features.shown("voting_gotm"),
    playing: features.shown("now_playing"),
    completed: features.shown("game_completions"),
    reviews: features.shown("reviews"),
    journals: features.shown("journals"),
    achievements: features.shown("achievement_hub"),
    gameLists: features.shown("game_lists"),
    // The member's own lists in the hero's split button (spec api#451).
    backlog: features.shown("backlog"),
    collection: features.shown("collection"),
    // The Releases section always shows (it is the game index's); only its
    // link to the Release Calendar follows that Feature.
    releaseCalendar: features.shown("release_calendar"),
  };
  return { game, session, features, show };
}

// The first reviews of the game, and the viewer's own Draft of it (which
// takes the compose prompt's place). The Drafts listing has no game filter,
// so the page looks through the newest.
export async function loadGameReviews(gameId: number, viewerId: string | null) {
  const [reviewsRes, drafts] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}/reviews?per=${REVIEWS_READ}`, { cache: "no-store" }),
    viewerId ? fetchOwnDrafts(viewerId, { gameId, per: 5 }) : null,
  ]);
  let reviews: Review[] = [];
  let reviewTotal: number | null = null;
  if (reviewsRes.ok) {
    const body: ApiCollection<Review> = await reviewsRes.json();
    reviews = body.data;
    reviewTotal = paginationOf(body.meta, reviews.length).total;
  }
  const ownDraft = drafts ? draftOfGame(drafts.drafts, gameId) : null;
  return { reviews, reviewTotal, ownDraft: ownDraft && drafts ? { draft: ownDraft, now: drafts.now } : null };
}

export type GamePageShow = NonNullable<Awaited<ReturnType<typeof loadGamePage>>>["show"];

// What the viewer may do on the game page, by their membership: the hero's
// Edit game, behind the Game Edit page's gates.
export function gamePageGates(membership: Parameters<typeof gameEditViewer>[0]) {
  return { canEdit: gameEditViewer(membership) !== null };
}

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
  const data = await fetchMemberDirectory(MEMBERS_REVALIDATE_SECONDS);
  return new Map((data ?? []).map((user) => [user.user_id, memberName(user)]));
}

// The game's linked Discord threads for the hero panel, or null when the read
// fails (signed out).
export async function fetchGameThreads(gameId: number): Promise<Thread[] | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/threads?per=50`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiCollection<Thread>).data;
  } catch {
    return null;
  }
}
