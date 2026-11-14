import Link from "next/link";

export interface ReaderNeighbour {
  href: string;
  title: string;
}

// The reader's foot: the newer and older reviews either side.
export function ReviewReaderNeighbours({
  newer,
  older,
}: {
  newer: ReaderNeighbour | null;
  older: ReaderNeighbour | null;
}) {
  return (
    <nav
      aria-label="More reviews"
      className="mt-8 flex justify-between gap-3.5 border-t border-border pt-4"
    >
      {newer ? (
        <Link
          href={newer.href}
          className="group/nx font-label flex max-w-[48%] flex-col gap-1 text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground"
        >
          Previous
          <b className="text-base leading-tight tracking-[0.01em] text-foreground transition-colors group-hover/nx:text-highlight">
            {newer.title}
          </b>
        </Link>
      ) : (
        <span />
      )}
      {older && (
        <Link
          href={older.href}
          className="group/nx font-label flex max-w-[48%] flex-col gap-1 text-right text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground"
        >
          Next review
          <b className="text-base leading-tight tracking-[0.01em] text-foreground transition-colors group-hover/nx:text-highlight">
            {older.title}
          </b>
        </Link>
      )}
    </nav>
  );
}
