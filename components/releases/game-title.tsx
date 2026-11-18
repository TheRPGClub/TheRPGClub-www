import Link from "next/link";
import { cn } from "@/lib/utils";

// A game's title on the Release Calendar, linking to its game page.
// `label`, when set, is the link's whole accessible name (the grid adds
// "first released ..." there, having no room to show it).
export function GameTitle({
  gameId,
  title,
  label,
  past = false,
  className,
}: {
  gameId: number;
  title: string;
  label?: string;
  past?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/games/${gameId}`}
      aria-label={label}
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
