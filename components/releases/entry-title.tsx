import Link from "next/link";
import { cn } from "@/lib/utils";

// A game's title on the Release Calendar, linking to its game page.
export function EntryTitle({
  gameId,
  title,
  past = false,
  className,
}: {
  gameId: number;
  title: string;
  past?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/games/${gameId}`}
      className={cn(
        "rounded-xs leading-[1.25] font-semibold transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        past ? "text-faint-foreground" : "text-foreground",
        className,
      )}
    >
      {title}
    </Link>
  );
}
