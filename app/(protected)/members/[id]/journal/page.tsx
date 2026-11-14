import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  GameCompletion,
  GameSummary,
  User,
  UserNowPlaying,
} from "@/lib/api/types";
import {
  JOURNAL_READ_MAX,
  fetchFirstEntryAt,
  fetchGameJournal,
  fetchJournaledGames,
} from "@/lib/api/journals";
import { journalDate, romanNumeral, sortChapters } from "@/lib/journals";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { memberCounts, memberName } from "@/components/member/member-lists";
import { JournalPage, JournalRunningHead, JournalVolume } from "@/components/journal/journal-book";
import { JournalChapter } from "@/components/journal/journal-chapter";
import { JournalContents, type JournalChapterRow } from "@/components/journal/journal-contents";
import { JournalEntryEditor } from "@/components/journal/journal-entry-editor";

// A member's Game Journal as a bound volume: the Contents page (one chapter
// per game) beside the open chapter. The owner writes the next entry at the
// top of the chapter and edits or deletes their own; everyone else reads.
//
// ?game=<id> opens a chapter (default: the newest), ?page=<n> turns its
// pages, ?new=1 starts a chapter for a game not in the book yet.

const PER_PAGE = 10;

async function readIds<T>(path: string, pick: (row: T) => number | null): Promise<Set<number>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return new Set();
    const body = (await res.json()) as ApiCollection<T>;
    return new Set(body.data.map(pick).filter((n): n is number => n != null));
  } catch {
    return new Set();
  }
}

async function readGame(gameId: number): Promise<GameSummary | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSingle<GameSummary>).data;
  } catch {
    return null;
  }
}

function positiveInt(value: string | string[] | undefined): number | null {
  const n = parseInt(Array.isArray(value) ? value[0] : (value ?? ""), 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export default async function MemberJournalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const gameParam = positiveInt(query.game);
  const pageParam = positiveInt(query.page) ?? 1;
  const startingNew = query.new === "1";

  const [userRes, session, journaled, playingIds, completedIds] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    getSession(),
    fetchJournaledGames(id),
    // The Now Playing and Game Completion marks, from the member's own lists.
    readIds<UserNowPlaying>(`/api/v1/users/${id}/now_playing?per=${JOURNAL_READ_MAX}`, (r) => r.gamedb_game_id),
    readIds<GameCompletion>(`/api/v1/users/${id}/completions?per=${JOURNAL_READ_MAX}`, (r) => r.gamedb_game_id),
  ]);
  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);
  const viewerId = session?.principal.discord_id ?? null;
  const isOwner = viewerId === user.user_id;

  const chapters: JournalChapterRow[] = sortChapters(journaled?.data ?? [])
    .filter((row) => row.game)
    .map((row) => ({
      game: row.game!,
      entryCount: row.entry_count,
      lastEntryAt: row.last_entry_at,
      nowPlaying: playingIds.has(row.game!.game_id),
      completed: completedIds.has(row.game!.game_id),
    }));
  const entryTotal = chapters.reduce((sum, c) => sum + c.entryCount, 0);

  const openGameId = startingNew ? null : (gameParam ?? chapters[0]?.game.game_id ?? null);
  const chapterIndex = chapters.findIndex((c) => c.game.game_id === openGameId);
  const row = chapterIndex >= 0 ? chapters[chapterIndex] : null;
  // The chapter's game (read only when it isn't in the book yet: the owner
  // arriving from a game page) and its page of entries, read together. When
  // the chapter is in the book its count is known, so the oldest entry (for
  // the run's first date) is read alongside unless this page holds it.
  const oldestOnThisPage = row ? pageParam >= Math.ceil(row.entryCount / PER_PAGE) : true;
  const [openGame, openEntries, oldestAt] = await Promise.all([
    row?.game ?? (openGameId ? readGame(openGameId) : null),
    openGameId
      ? fetchGameJournal(openGameId, { userId: user.user_id, page: pageParam, per: PER_PAGE })
      : null,
    row && !oldestOnThisPage
      ? fetchFirstEntryAt(row.game.game_id, user.user_id, row.entryCount)
      : undefined,
  ]);
  const entries = openGame ? openEntries : null;
  const count = entries?.meta.count ?? 0;
  const pages = Math.max(1, entries?.meta.pages ?? 1);
  const per = entries?.meta.per || PER_PAGE;
  const lastPage = entries ? entries.meta.page >= pages : true;
  // The run's first entry: on this page when it's the last one, else the
  // oldest read above, else one extra read for it.
  const firstEntryAt =
    entries && entries.data.length > 0 && lastPage
      ? entries.data[entries.data.length - 1].created_at
      : oldestAt !== undefined
        ? oldestAt
        : openGame && count > 0
          ? await fetchFirstEntryAt(openGame.game_id, user.user_id, count)
          : null;
  const lastEntryAt = row?.lastEntryAt ?? (pageParam === 1 ? (entries?.data[0]?.created_at ?? null) : null);
  const today = journalDate(new Date().toISOString(), true) ?? "";

  const base = `/members/${user.user_id}/journal`;
  const pageHref = (p: number) =>
    `${base}?game=${openGame?.game_id}${p > 1 ? `&page=${p}` : ""}`;

  return (
    <MemberListTemplate
      userId={user.user_id}
      displayName={displayName}
      title="Journal"
      count={chapters.length}
      countNoun={["chapter", "chapters"]}
      current="journal"
      counts={memberCounts(user)}
    >
      {journaled === null ? (
        <p className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
          The journal couldn&apos;t be loaded right now.
        </p>
      ) : chapters.length === 0 && !isOwner ? (
        <p className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
          {displayName} hasn&apos;t journaled any games yet.
        </p>
      ) : (
        <JournalVolume>
          <div className="grid gap-1.5 lg:min-h-[668px] lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-0">
            <JournalContents
              userId={user.user_id}
              displayName={displayName}
              chapters={chapters}
              openGameId={openGame?.game_id ?? null}
              entryTotal={entryTotal}
              newChapterHref={isOwner ? `${base}?new=1` : undefined}
            />
            {openGame && entries ? (
              <JournalChapter
                chapterLabel={row ? `Chapter ${romanNumeral(chapterIndex + 1)}` : "New chapter"}
                game={openGame}
                entries={entries.data}
                count={count}
                page={entries.meta.page}
                pages={pages}
                per={per}
                firstEntryAt={firstEntryAt}
                lastEntryAt={lastEntryAt}
                nowPlaying={playingIds.has(openGame.game_id)}
                completed={completedIds.has(openGame.game_id)}
                viewerId={viewerId}
                ownerId={user.user_id}
                composeLabel={`Entry ${count + 1} · ${today}`}
                pageHref={pageHref}
              />
            ) : (
              <JournalPage as="section" side="right" aria-label="New chapter" className="px-4 pb-4 sm:px-7.5">
                <JournalRunningHead parts={["New chapter"]} />
                <h2 className="font-headline mt-4 mb-3.5 border-b-2 border-paper pb-3 text-[2.4rem] leading-[0.9]">
                  {openGameId && !openGame ? "Game not found" : "A new chapter"}
                </h2>
                {isOwner ? (
                  <>
                    <p className="mb-3.5 max-w-[60ch] text-[0.95rem] text-paper-dim">
                      Pick the game, then write its first entry. The chapter goes in
                      your Contents once it&apos;s saved.
                    </p>
                    <JournalEntryEditor
                      userId={user.user_id}
                      game={null}
                      chapterGameId={null}
                      label={`Entry 1 · ${today}`}
                    />
                  </>
                ) : (
                  <p className="text-sm text-paper-mute">Pick a chapter from the Contents.</p>
                )}
              </JournalPage>
            )}
          </div>
        </JournalVolume>
      )}
    </MemberListTemplate>
  );
}
