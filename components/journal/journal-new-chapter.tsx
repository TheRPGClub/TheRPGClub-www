import { JournalPage, JournalRunningHead } from "@/components/journal/journal-book";
import { JournalEntryEditor } from "@/components/journal/journal-entry-editor";

// The right page when no chapter is open: the owner starts a new one (the
// game, then its first entry); anyone else is sent to the Contents.
export function JournalNewChapter({
  userId,
  isOwner,
  notFound,
  today,
}: {
  userId: string;
  isOwner: boolean;
  // A chapter was asked for, but its game couldn't be read.
  notFound: boolean;
  // Today's date, for the first entry's label.
  today: string;
}) {
  return (
    <JournalPage as="section" side="right" aria-label="New chapter" className="px-4 pb-4 sm:px-7.5">
      <JournalRunningHead parts={["New chapter"]} />
      <h2 className="font-headline mt-4 mb-3.5 border-b-2 border-foreground pb-3 text-[2.4rem] leading-[0.9]">
        {notFound ? "Game not found" : "A new chapter"}
      </h2>
      {isOwner ? (
        <>
          <p className="mb-3.5 max-w-[60ch] text-[0.95rem] text-dim-foreground">
            Pick the game, then write its first entry. The chapter goes in your Contents once it&apos;s saved.
          </p>
          <JournalEntryEditor userId={userId} game={null} chapterGameId={null} label={`Entry 1 · ${today}`} />
        </>
      ) : (
        <p className="text-sm text-faint-foreground">Pick a chapter from the Contents.</p>
      )}
    </JournalPage>
  );
}
