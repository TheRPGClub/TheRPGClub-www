import Link from "next/link";
import { PenLine } from "lucide-react";
import type { GameCompletion, JournalEntry } from "@/lib/api/types";
import { fetchGameJournal } from "@/lib/api/journals";
import { buildChronology, chapterHref, memberInk } from "@/lib/journals";
import { memberName } from "@/lib/achievements";
import { SectionHeading } from "@/components/templates/page-header";
import { JournalVolume } from "@/components/journal/journal-book";
import { GameJournalPlate, type PlateLine } from "@/components/journal/game-journal-plate";
import { buttonVariants } from "@/components/ui/button";

// The reader shows a few lines of each entry; the rest is on the chapter.
const READER_BODY_CHARS = 600;

// The game page's Game Journal: a chronology plate with one chapter line per
// member beside that member's entries. One read covers the game's journal.
export async function GameJournalSection({
  gameId,
  completions,
  viewerId,
}: {
  gameId: number;
  // The game's Game Completions (from the game read), for the diamonds.
  // Null while Game Completions isn't shown to the viewer: no diamonds and
  // no diamond in the legend.
  completions: GameCompletion[] | null;
  viewerId: string | null;
}) {
  const journal = await fetchGameJournal(gameId);
  const entries = journal?.data ?? [];
  const chronology = buildChronology(entries, completions ?? []);
  const members = chronology?.lines.length ?? 0;
  const total = journal?.meta.count ?? 0;

  const names = new Map<string, string>();
  const byUser = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    if (entry.user) names.set(entry.user_id, memberName(entry.user));
    const list = byUser.get(entry.user_id) ?? [];
    list.push({
      entry_id: entry.entry_id,
      user_id: entry.user_id,
      gamedb_game_id: entry.gamedb_game_id,
      entry_title: entry.entry_title,
      entry_body:
        entry.entry_body.length > READER_BODY_CHARS
          ? `${entry.entry_body.slice(0, READER_BODY_CHARS).trimEnd()}…`
          : entry.entry_body,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    });
    byUser.set(entry.user_id, list);
  }
  const lines: PlateLine[] = (chronology?.lines ?? []).map((line) => {
    const list = byUser.get(line.userId) ?? [];
    return {
      ...line,
      name: names.get(line.userId) ?? "Member",
      ink: memberInk(line.userId),
      count: list.length,
      entries: list,
    };
  });

  return (
    <section aria-labelledby="game-journal" className="mt-10">
      <SectionHeading
        title={<span id="game-journal">Game Journal</span>}
        count={
          total > 0
            ? `${total} ${total === 1 ? "entry" : "entries"} · ${members} ${members === 1 ? "member" : "members"}`
            : undefined
        }
        action={
          viewerId && (
            <Link
              href={chapterHref(viewerId, gameId)}
              className={buttonVariants({ variant: "highlight" })}
            >
              <PenLine aria-hidden />
              Write an entry
            </Link>
          )
        }
        className="items-center"
      />
      {journal === null ? (
        <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
          The journal couldn&apos;t be loaded right now.
        </p>
      ) : chronology === null || lines.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-6 text-sm text-paper-mute">
          No one has journaled this game yet.
        </p>
      ) : (
        <JournalVolume className="mt-3.5">
          <GameJournalPlate
            gameId={gameId}
            lines={lines}
            ticks={chronology.ticks}
            span={chronology.span}
            numbered={entries.length >= total}
            completionKey={completions !== null}
          />
        </JournalVolume>
      )}
    </section>
  );
}
