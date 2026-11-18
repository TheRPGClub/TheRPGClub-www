import Link from "next/link";
import { Link2 } from "lucide-react";
import { entryHref } from "@/lib/codex/paths";
import type { CodexEntryLink } from "@/lib/codex/types";

// A Fun Fact card's other See also (www#127): the links besides the Lore
// Entry its "Read the story" opens, each its title linking to the entry, in
// the card's ink.
export function FunFactLinks({ links }: { links: readonly CodexEntryLink[] }) {
  if (links.length === 0) return null;
  return (
    <span className="flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-1">
        <Link2 aria-hidden className="size-3.5 self-center" />
        See also
      </span>
      {links.map((link) => (
        <Link
          key={link.id}
          href={entryHref(link)}
          className="max-w-full truncate font-sans text-[0.875rem] font-semibold tracking-normal normal-case underline decoration-background/55 underline-offset-[3px] hover:decoration-background"
        >
          {link.title}
        </Link>
      ))}
    </span>
  );
}
