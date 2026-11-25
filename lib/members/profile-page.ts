import { apiFetch } from "@/lib/api";
import { getFeatures, getSession } from "@/lib/session";
import type {
  ApiCollection,
  Game,
  GameCollection,
  GameCompletion,
  JournaledGame,
  Review,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
  UserProfile,
} from "@/lib/api/types";
import { NO_ROWS, paginationOf, type ListPage } from "@/lib/api/pagination";
import { shownImportKinds } from "@/lib/imports/kinds";
import { loadMemberRuns } from "@/lib/challenges/member-runs";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import { fetchMember } from "@/lib/members/member-page";
import { memberCounts } from "@/lib/members/member-lists";
import { fetchMemberGameLists } from "@/lib/game-lists/api";
import {
  parseShelfSorts,
  profilePlaytime,
  shelfSortQuery,
  type NowPlayingPlaytime,
  type ShelfPlaytime,
  type ShelfSorts,
} from "@/lib/members/profile-playtime";

// A member's page reads as one idea: what they're playing now is open on the
// desk (face-on key art), everything else is closed books on a bookcase, one
// shelf per list, and their latest reviews follow. Read-only; the owner
// manages each list on its own page.

export const SHELF_LIMIT = 12;

async function fetchPreview<T>(
  path: string,
  // False when the list's Feature isn't shown: skip the read.
  shown = true,
): Promise<ListPage<T>> {
  if (!shown) return NO_ROWS;
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return NO_ROWS;
    const body: ApiCollection<T> = await res.json();
    return { data: body.data, total: paginationOf(body.meta, body.data.length).total };
  } catch {
    return NO_ROWS;
  }
}

// The banner wears the member's own pick: their #1 favorite's art, else
// what they're playing. No pick, no art.
export function bannerArt(
  favorites: { game?: Game | null }[],
  nowPlaying: { game?: Game | null }[],
): string | null {
  return (
    [favorites[0]?.game, ...nowPlaying.map((e) => e.game)].find((g) => g?.art_url)
      ?.art_url ?? null
  );
}

// The profile payload's newest chapters (the API's `journal` preview), and
// the chapter tally: the payload's count, else the preview's.
export function journalPreview(
  user: { journal?: JournaledGame[] },
  count: number | undefined,
) {
  const rows = (user.journal ?? []).filter((row) => row.game);
  return { rows, chapters: count ?? rows.length };
}

// Each department belongs to a Feature; one this viewer isn't shown (flag or
// preference) is left out, and so is its read. Favorites belongs to none, so
// it, the profile and the session don't wait on the Features. Each list is
// read on its own rather than from the profile's `previews` slice, which
// doesn't always carry the joined game (and so the art), nor each game's
// Playtime. A shelf sorted Most played is read in that order (`sorts`, from
// the URL). Null when the member can't be read (a 404).
export async function loadMemberProfile(
  id: string,
  sorts: ShelfSorts = parseShelfSorts({}),
) {
  const showRead = getFeatures().then((features) => ({
    nowPlaying: features.shown("now_playing"),
    completed: features.shown("game_completions"),
    backlog: features.shown("backlog"),
    collection: features.shown("collection"),
    achievements: features.shown("achievement_hub"),
    reviews: features.shown("reviews"),
    journal: features.shown("journals"),
    gameLists: features.shown("game_lists"),
    challenges: features.shown("challenges"),
    imports: shownImportKinds(features).length > 0,
  }));
  const users = `/api/v1/users/${id}`;
  const [user, session, favorites, show, [nowPlaying, completed, backlog, collection, reviews, achievements, runs, gameLists]] =
    await Promise.all([
      fetchMember<UserProfile & { journal?: JournaledGame[] } & Parameters<typeof profilePlaytime>[0]>(id),
      getSession(),
      fetchPreview<UserFavorite & ShelfPlaytime>(
        `${users}/favorites?per=${SHELF_LIMIT}${shelfSortQuery(sorts.favorites)}`,
      ),
      showRead,
      showRead.then((show) =>
        Promise.all([
          fetchPreview<UserNowPlaying & NowPlayingPlaytime>(`${users}/now_playing?per=6`, show.nowPlaying),
          fetchPreview<GameCompletion & ShelfPlaytime>(
            `${users}/completions?per=${SHELF_LIMIT}${shelfSortQuery(sorts.completed)}`,
            show.completed,
          ),
          fetchPreview<UserBacklog & ShelfPlaytime>(
            `${users}/backlog?per=${SHELF_LIMIT}${shelfSortQuery(sorts.backlog)}`,
            show.backlog,
          ),
          fetchPreview<GameCollection & ShelfPlaytime>(
            `${users}/collections?per=${SHELF_LIMIT}${shelfSortQuery(sorts.collection)}`,
            show.collection,
          ),
          fetchPreview<Review>(`${users}/reviews?per=3`, show.reviews),
          show.achievements ? fetchAchievementSummary(id) : null,
          show.challenges ? loadMemberRuns(id) : null,
          show.gameLists ? fetchMemberGameLists(id) : null,
        ]),
      ),
    ]);
  if (!user) return null;

  // The profile payload's counts, else the per-list totals.
  const aggregated = memberCounts(user);
  const counts = {
    now_playing: aggregated.now_playing ?? nowPlaying.total,
    favorites: aggregated.favorites ?? favorites.total,
    completed: aggregated.completed ?? completed.total,
    reviews: aggregated.reviews ?? reviews.total,
    backlog: aggregated.backlog ?? backlog.total,
    collection: aggregated.collection ?? collection.total,
  };
  return {
    user,
    session,
    isSelf: session?.principal.discord_id === user.user_id,
    show,
    counts,
    lists: { favorites, nowPlaying, completed, backlog, collection, reviews },
    // The member's game hours (null from an API without them), and each
    // shelf's order.
    playtime: profilePlaytime(user),
    sorts,
    achievements,
    runs,
    // The member's Game Lists the viewer may read; null when hidden or unread.
    gameLists,
    journal: journalPreview(user, aggregated.journal),
  };
}

export type MemberProfile = NonNullable<Awaited<ReturnType<typeof loadMemberProfile>>>;
