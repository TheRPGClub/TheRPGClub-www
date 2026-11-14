import type { GameSummary, JournaledGame } from "@/lib/api/types";
import {
  fetchFirstEntryAt,
  fetchGameJournal,
  fetchJournalGame,
  fetchJournaledGames,
  fetchListedGameIds,
} from "@/lib/api/journals";
import { memberName } from "@/lib/achievements";
import { journalDate, sortChapters } from "@/lib/journals";
import { fetchMember } from "@/lib/members/member-page";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { getSession } from "@/lib/session";

// A member's Game Journal as a bound volume: the Contents page (one chapter
// per game) beside the open chapter. The owner writes the next entry at the
// top of the chapter and edits or deletes their own; everyone else reads.
//
// ?game=<id> opens a chapter (default: the newest), ?page=<n> turns its
// pages, ?new=1 starts a chapter for a game not in the book yet.

const PER_PAGE = 10;

export interface VolumeQuery {
  gameId: number | null;
  page: number;
  startingNew: boolean;
}

function positiveInt(value: string | string[] | undefined): number | null {
  const n = parseInt(firstParam(value) ?? "", 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function parseVolumeQuery(query: RawSearchParams): VolumeQuery {
  return {
    gameId: positiveInt(query.game),
    page: positiveInt(query.page) ?? 1,
    startingNew: query.new === "1",
  };
}

// One chapter on the Contents page, with the marks it carries from the
// member's lists.
export interface JournalChapterRow {
  game: GameSummary;
  entryCount: number;
  lastEntryAt: string | null;
  nowPlaying: boolean;
  completed: boolean;
}

export function chapterRows(
  journaled: JournaledGame[],
  playingIds: ReadonlySet<number>,
  completedIds: ReadonlySet<number>,
): JournalChapterRow[] {
  return sortChapters(journaled).flatMap((row) =>
    row.game
      ? [
          {
            game: row.game,
            entryCount: row.entry_count,
            lastEntryAt: row.last_entry_at,
            nowPlaying: playingIds.has(row.game.game_id),
            completed: completedIds.has(row.game.game_id),
          },
        ]
      : [],
  );
}

// The chapter the page opens: the asked-for game (a game not in the book yet
// opens as a new chapter, index -1), else the newest; nothing while a new
// chapter is being started.
export function openChapter(chapters: JournalChapterRow[], query: VolumeQuery) {
  const gameId = query.startingNew ? null : (query.gameId ?? chapters[0]?.game.game_id ?? null);
  const index = chapters.findIndex((c) => c.game.game_id === gameId);
  return { gameId, index, row: index >= 0 ? chapters[index] : null };
}

// The run's first entry when this page holds it (the chapter's last page
// ends on it, entries newest first); undefined when it isn't known here.
export function firstEntryOnPage(entries: { created_at: string }[], lastPage: boolean): string | undefined {
  return lastPage && entries.length > 0 ? entries[entries.length - 1].created_at : undefined;
}

// Everything the volume shows, or null when the member doesn't exist.
export async function loadJournalVolume(id: string, query: VolumeQuery) {
  const [user, session, journaled, playingIds, completedIds] = await Promise.all([
    fetchMember(id),
    getSession(),
    fetchJournaledGames(id),
    fetchListedGameIds(id, "now_playing"),
    fetchListedGameIds(id, "completions"),
  ]);
  if (!user) return null;
  const viewerId = session?.principal.discord_id ?? null;
  const chapters = chapterRows(journaled?.data ?? [], playingIds, completedIds);
  const open = openChapter(chapters, query);
  const { row } = open;

  // The chapter's game (read only when it isn't in the book yet: the owner
  // arriving from a game page) and its page of entries, read together. When
  // the chapter is in the book its count is known, so the oldest entry (for
  // the run's first date) is read alongside unless this page holds it.
  const oldestOnThisPage = row ? query.page >= Math.ceil(row.entryCount / PER_PAGE) : true;
  const [openGame, openEntries, oldestAt] = await Promise.all([
    row?.game ?? (open.gameId ? fetchJournalGame(open.gameId) : null),
    open.gameId ? fetchGameJournal(open.gameId, { userId: user.user_id, page: query.page, per: PER_PAGE }) : null,
    row && !oldestOnThisPage ? fetchFirstEntryAt(row.game.game_id, user.user_id, row.entryCount) : undefined,
  ]);
  const entries = openGame ? openEntries : null;
  const count = entries?.meta.count ?? 0;
  const pages = Math.max(1, entries?.meta.pages ?? 1);
  const lastPage = entries ? entries.meta.page >= pages : true;
  // The run's first entry: on this page when it's the last one, else the
  // oldest read above, else one extra read for it.
  const onPage = entries ? firstEntryOnPage(entries.data, lastPage) : undefined;
  const firstEntryAt =
    onPage !== undefined
      ? onPage
      : oldestAt !== undefined
        ? oldestAt
        : openGame && count > 0
          ? await fetchFirstEntryAt(openGame.game_id, user.user_id, count)
          : null;

  return {
    user,
    displayName: memberName(user),
    viewerId,
    isOwner: viewerId === user.user_id,
    // The member's chapters couldn't be read.
    failed: journaled === null,
    chapters,
    entryTotal: chapters.reduce((sum, c) => sum + c.entryCount, 0),
    open,
    openGame,
    entries,
    count,
    pages,
    per: entries?.meta.per || PER_PAGE,
    firstEntryAt,
    lastEntryAt: row?.lastEntryAt ?? (query.page === 1 ? (entries?.data[0]?.created_at ?? null) : null),
    today: journalDate(new Date().toISOString(), true) ?? "",
    playingIds,
    completedIds,
  };
}

export type JournalVolumeView = NonNullable<Awaited<ReturnType<typeof loadJournalVolume>>>;
