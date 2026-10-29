import { cn } from "@/lib/utils";

// Headlines break at the subtitle colon ("Metaphor:" / "ReFantazio"); a title
// without one breaks before its last word, and a one-word title is all second
// line. The same rule the dashboard's cover story uses, so a game's name sets
// the same way on its own page as on the cover.
export function splitGameTitle(title: string): [string, string] {
  const colon = title.indexOf(":");
  if (colon > 0 && colon < title.length - 1) {
    return [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  }
  const space = title.lastIndexOf(" ");
  if (space > 0) return [title.slice(0, space), title.slice(space + 1)];
  return ["", title];
}

// A game's two-line headline: the first line in paper, the second in the
// track's accent (yellow for a GOTM winner, violet for an NR-GOTM one, paper
// for everything else).
export function GameHeadline({
  title,
  accentClassName,
  className,
  as: Tag = "h1",
}: {
  title: string;
  accentClassName?: string;
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  const [first, second] = splitGameTitle(title);
  return (
    <Tag className={cn("font-headline text-balance break-words", className)}>
      {first && <span className="block">{first}</span>}
      <span className={cn("block", accentClassName)}>{second}</span>
    </Tag>
  );
}

// Box art with a deliberate fallback: a game with no cover gets an ink block
// with its title set in the headline voice, never an empty grey rectangle.
export function GameCover({
  title,
  coverUrl,
  className,
  fallbackClassName,
  alt,
}: {
  title: string;
  coverUrl: string | null | undefined;
  // Size, ratio and radius.
  className?: string;
  // Type size for the fallback title, scaled to the cover.
  fallbackClassName?: string;
  // Decorative by default; pass a description where the cover is the only
  // thing naming the game.
  alt?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] shrink-0 overflow-hidden rounded-sm bg-ink-3 outline -outline-offset-1 outline-paper/12",
        className,
      )}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={alt ?? ""}
          className="size-full object-cover"
        />
      ) : (
        <span
          className={cn(
            "font-headline grid size-full place-items-center p-3 text-center text-2xl leading-[0.95] text-paper-mute",
            fallbackClassName,
          )}
        >
          {title}
        </span>
      )}
    </div>
  );
}
