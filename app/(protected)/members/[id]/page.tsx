import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Dices, GitCompareArrows } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getFeatures, getSession } from "@/lib/session";
import { resolveEntryId } from "@/lib/api/game-list-entry";
import type {
  ApiCollection,
  ApiSingle,
  GameCollection,
  GameCompletion,
  JournaledGame,
  Review,
  UserBacklog,
  UserFavorite,
  UserNowPlaying,
  UserProfile,
  UserSocial,
} from "@/lib/api/types";
import { NO_ROWS, paginationOf, type ListPage } from "@/lib/api/pagination";
import { importsHubHref, shownImportKinds } from "@/lib/imports/kinds";
import { chapterHref, journalDate } from "@/lib/journals";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import { MemberAchievementsSection } from "@/components/achievements/member-achievements-section";
import { MemberBanner } from "@/components/issue/member-banner";
import { platformShort } from "@/components/issue/member-cover";
import { NowPlayingBooks } from "@/components/issue/member-now-playing";
import { MemberReviewRows } from "@/components/issue/member-review-rows";
import {
  MemberShelf,
  PodiumSpines,
  Spine,
} from "@/components/issue/member-shelf";
import {
  SectionHeading,
  headingLinkClass,
} from "@/components/templates/page-header";
import {
  completionMonth,
  memberCounts,
  memberListHref,
  memberName,
  monthShort,
} from "@/components/member/member-lists";

// A member's page reads as one idea: what they're playing now is open on the
// desk (face-on key art), everything else is closed books on a bookcase, one
// shelf per list, and their latest reviews follow. Read-only; managing the
// lists lives on the edit page.

const SHELF_LIMIT = 12;
// Phones show this many spines per shelf; the rest are a tap on the list.
const MOBILE_SPINES = 6;

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
    return {
      data: body.data,
      total: paginationOf(body.meta, body.data.length).total,
    };
  } catch {
    return NO_ROWS;
  }
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Each department below belongs to a Feature; one this viewer isn't shown
  // (flag or preference) is left out, and so is its read. Favorites belongs
  // to none, so it, the profile and the session don't wait on the Features.
  const showRead = getFeatures().then((features) => ({
    nowPlaying: features.shown("now_playing"),
    completed: features.shown("game_completions"),
    backlog: features.shown("backlog"),
    collection: features.shown("collection"),
    achievements: features.shown("achievement_hub"),
    reviews: features.shown("reviews"),
    journal: features.shown("journals"),
    imports: shownImportKinds(features).length > 0,
  }));

  // Each list is read on its own rather than from the profile's `previews`
  // slice, which doesn't always carry the joined game (and so the art).
  const [
    userRes,
    session,
    favoritesPreview,
    show,
    [
      nowPlayingPreview,
      completedPreview,
      backlogPreview,
      collectionPreview,
      reviewsPreview,
      achievements,
    ],
  ] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    getSession(),
    fetchPreview<UserFavorite>(`/api/v1/users/${id}/favorites?per=${SHELF_LIMIT}`),
    showRead,
    showRead.then((show) =>
      Promise.all([
        fetchPreview<UserNowPlaying>(`/api/v1/users/${id}/now_playing?per=6`, show.nowPlaying),
        fetchPreview<GameCompletion>(`/api/v1/users/${id}/completions?per=${SHELF_LIMIT}`, show.completed),
        fetchPreview<UserBacklog>(`/api/v1/users/${id}/backlog?per=${SHELF_LIMIT}`, show.backlog),
        fetchPreview<GameCollection>(`/api/v1/users/${id}/collections?per=${SHELF_LIMIT}`, show.collection),
        fetchPreview<Review>(`/api/v1/users/${id}/reviews?per=3`, show.reviews),
        show.achievements ? fetchAchievementSummary(id) : null,
      ]),
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<UserProfile> = await userRes.json();
  const collection = collectionPreview.data;
  const reviews = reviewsPreview.data;

  const displayName = memberName(user);
  const isSelf = session?.principal.discord_id === user.user_id;
  const socials: UserSocial[] = user.socials ?? [];
  // The profile payload's counts, else the per-list totals.
  const aggregated = memberCounts(user);
  const counts = {
    now_playing: aggregated.now_playing ?? nowPlayingPreview.total,
    favorites: aggregated.favorites ?? favoritesPreview.total,
    completed: aggregated.completed ?? completedPreview.total,
    reviews: aggregated.reviews ?? reviewsPreview.total,
    backlog: aggregated.backlog ?? backlogPreview.total,
    collection: aggregated.collection ?? collectionPreview.total,
  };
  const nowPlaying = nowPlayingPreview.data;
  // The profile payload's newest chapters (the API's `journal` preview).
  const journalPreview = (
    (user as UserProfile & { journal?: JournaledGame[] }).journal ?? []
  ).filter((row) => row.game);
  const journalChapters = aggregated.journal ?? journalPreview.length;
  const favorites = favoritesPreview.data;
  const memberHref = `/members/${user.user_id}`;
  const listHref = (key: Parameters<typeof memberListHref>[1]) =>
    memberListHref(user.user_id, key);

  // The banner wears the member's own pick: their #1 favorite's art, else
  // what they're playing. No pick, no art.
  const bannerGame =
    [favorites[0]?.game, ...nowPlaying.map((e) => e.game)].find(
      (g) => g?.art_url,
    ) ?? null;

  const mobileCut = (i: number) => (i >= MOBILE_SPINES ? "max-sm:hidden" : "");
  const more = (key: Parameters<typeof memberListHref>[1], total: number, shown: number) => ({
    count: total - shown,
    href: listHref(key),
  });

  return (
    <div className="space-y-10">
      <MemberBanner
        userId={user.user_id}
        displayName={displayName}
        username={user.username}
        joinedAt={user.server_joined_at}
        membership={user.membership}
        socials={socials}
        art={bannerGame?.art_url ?? null}
        owner={
          isSelf
            ? {
                editHref: `${memberHref}/edit`,
                importsHref: show.imports ? importsHubHref(user.user_id) : null,
              }
            : null
        }
      />

      {show.nowPlaying && (
        <section aria-labelledby="now-playing" className="space-y-4.5">
          <SectionHeading
            title={<span id="now-playing">Now playing</span>}
            count={counts.now_playing}
            action={
              counts.now_playing > 0 && (
                <Link href={listHref("now_playing")} className={headingLinkClass}>
                  See all
                  <ArrowRight aria-hidden />
                </Link>
              )
            }
          />
          {nowPlaying.length > 0 ? (
            <NowPlayingBooks entries={nowPlaying} />
          ) : (
            <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground">
              Nothing in progress right now.
            </p>
          )}
        </section>
      )}

      <div className="border-t-2 border-foreground">
        <MemberShelf
          label="Favorites"
          count={counts.favorites}
          blurb={`Ranked by ${displayName}.`}
          links={[{ href: listHref("favorites"), label: "Open list" }]}
          more={more("favorites", counts.favorites, favorites.length)}
          empty="No favorites picked yet."
        >
          <PodiumSpines
            items={favorites.slice(0, 3).map((entry) => ({
              href: entry.game ? `/games/${entry.gamedb_game_id}` : null,
              game: entry.game,
              title: entry.game?.title ?? "Unknown game",
            }))}
          />
          {favorites.slice(3).map((entry, i) => (
            <Spine
              key={resolveEntryId("favorite", entry) ?? i}
              href={entry.game ? `/games/${entry.gamedb_game_id}` : null}
              game={entry.game}
              title={entry.game?.title ?? "Unknown game"}
              numeral={i + 4}
              height={206}
              className={mobileCut(i + 3)}
            />
          ))}
        </MemberShelf>

        {show.completed && (
          <MemberShelf
            label="Completed"
            count={counts.completed}
            blurb="Newest on the left."
            links={[
              { href: listHref("completed"), label: "Open list" },
              ...(session && !isSelf
                ? [
                    {
                      href: `${memberHref}/completed-games/compare`,
                      label: "Compare",
                      icon: <GitCompareArrows aria-hidden />,
                    },
                  ]
                : []),
            ]}
            more={more("completed", counts.completed, completedPreview.data.length)}
            empty="No completed games yet."
          >
            {completedPreview.data.map((entry, i) => {
              const month = completionMonth(entry.completed_at);
              return (
                <Spine
                  key={resolveEntryId("completed", entry) ?? i}
                  href={entry.game ? `/games/${entry.gamedb_game_id}` : null}
                  game={entry.game}
                  title={entry.game?.title ?? "Unknown game"}
                  tag={month ? `${monthShort(month)} ${month.slice(2, 4)}` : null}
                  className={mobileCut(i)}
                />
              );
            })}
          </MemberShelf>
        )}

        {show.backlog && (
          <MemberShelf
            label="Backlog"
            count={counts.backlog}
            blurb="Queued up."
            links={[
              { href: listHref("backlog"), label: "Open list" },
              ...(isSelf
                ? [
                    {
                      href: `${memberHref}/backlogged-games/pick`,
                      label: "Pick one at random",
                      icon: <Dices aria-hidden />,
                    },
                  ]
                : []),
            ]}
            more={more("backlog", counts.backlog, backlogPreview.data.length)}
            empty="Nothing queued up."
          >
            {backlogPreview.data.map((entry, i) => (
              <Spine
                key={resolveEntryId("backlog", entry) ?? i}
                href={entry.game ? `/games/${entry.gamedb_game_id}` : null}
                game={entry.game}
                title={entry.game?.title ?? "Unknown game"}
                tag={platformShort(entry.platform)}
                className={mobileCut(i)}
              />
            ))}
          </MemberShelf>
        )}

        {show.collection && (
          <MemberShelf
            label="Collection"
            count={counts.collection}
            blurb="Owned, by platform."
            links={[{ href: listHref("collection"), label: "Open list" }]}
            more={more("collection", counts.collection, collection.length)}
            empty="No owned games tracked."
          >
            {collection.map((entry, i) => (
              <Spine
                key={resolveEntryId("collection", entry) ?? i}
                href={entry.game ? `/games/${entry.gamedb_game_id}` : null}
                game={entry.game}
                title={entry.game?.title ?? "Unknown game"}
                tag={platformShort(entry.platform)}
                className={mobileCut(i)}
              />
            ))}
          </MemberShelf>
        )}
      </div>

      {/* Opt-in: only members with a Linked Account get the department. */}
      {achievements?.status === "ok" && (
        <MemberAchievementsSection summary={achievements.summary} />
      )}

      {show.reviews && (
        <section aria-labelledby="reviews" className="space-y-1">
          <SectionHeading
            title={<span id="reviews">Reviews</span>}
            count={counts.reviews}
            action={
              counts.reviews > 0 && (
                <Link href={listHref("reviews")} className={headingLinkClass}>
                  See all
                  <ArrowRight aria-hidden />
                </Link>
              )
            }
          />
          {reviews.length > 0 ? (
            <MemberReviewRows reviews={reviews} />
          ) : (
            <p className="mt-4 rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground">
              No reviews yet.
            </p>
          )}
        </section>
      )}

      {show.journal && (
        <section aria-labelledby="journal" className="space-y-4">
          <SectionHeading
            title={<span id="journal">Game Journal</span>}
            count={`${journalChapters} ${journalChapters === 1 ? "chapter" : "chapters"}`}
            action={
              (journalChapters > 0 || isSelf) && (
                <Link href={listHref("journal")} className={headingLinkClass}>
                  {journalChapters > 0 ? "Open the journal" : "Start your journal"}
                  <ArrowRight aria-hidden />
                </Link>
              )
            }
          />
          {journalPreview.length > 0 ? (
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {journalPreview.map((row) => (
                <li key={row.game!.game_id} className="border-b border-border">
                  <Link
                    href={chapterHref(user.user_id, row.game!.game_id)}
                    className="group flex items-baseline gap-3 py-2"
                  >
                    <span className="font-label min-w-0 flex-1 truncate text-base tracking-[0.04em] group-hover:text-highlight">
                      {row.game!.title}
                    </span>
                    {row.last_entry_at && (
                      <span className="text-[0.82rem] text-faint-foreground">
                        Last entry {journalDate(row.last_entry_at)}
                      </span>
                    )}
                    <span className="font-headline text-[1.15rem]">
                      {row.entry_count}
                      <span className="sr-only"> {row.entry_count === 1 ? "entry" : "entries"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground">
              No journal entries yet.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
