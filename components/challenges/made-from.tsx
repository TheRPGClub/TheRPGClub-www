import Link from "next/link";
import { ListOrdered } from "lucide-react";
import type { ChallengePool } from "@/lib/challenges/types";

// "Made from <list>" on the banner of a Pool started from a Game List
// (www#172, pick 9A): the list's name, a link to it when the viewer may
// read it. The banner sets it in a chip.
export function MadeFrom({ list }: { list: NonNullable<ChallengePool["game_list"]> }) {
  return (
    <>
      <ListOrdered aria-hidden className="size-3.5 shrink-0" />
      Made from{" "}
      {list.visible ? (
        <Link
          href={`/lists/${list.id}`}
          className="min-w-0 truncate text-foreground underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          {list.name}
        </Link>
      ) : (
        <span className="min-w-0 truncate text-foreground">{list.name}</span>
      )}
    </>
  );
}
