import Link from "next/link";
import type { LatelyItem } from "@/lib/codex/contents-page";
import type { CodexPart } from "@/lib/codex/types";
import { entryHref, PART_NAME } from "@/lib/codex/paths";
import { addedDay } from "@/lib/codex/wall";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/templates/page-header";

const SQUARE: Record<CodexPart, string> = {
  history_event: "bg-codex-history",
  lore_entry: "bg-codex-lore",
  fun_fact: "bg-codex-fact",
};

// "Lately in the Codex" (1C): the newest entries across all three parts as a
// contents list, each line its part's ink square, its title, a dotted leader
// and "Fun Fact · Grindlord · today".
export function LatelyList({ items }: { items: LatelyItem[] | null }) {
  return (
    <section aria-labelledby="codex-lately" className="mt-10">
      <SectionHeading title={<span id="codex-lately">Lately in the Codex</span>} />
      {items === null && <p className="mt-4 text-dim-foreground">The newest entries couldn&apos;t be read. Try again in a moment.</p>}
      {items?.length === 0 && (
        <p className="mt-4 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">Nothing in the Codex yet.</p>
      )}
      {items && items.length > 0 && (
        <ol className="mt-2.5 gap-x-10 md:columns-2">
          {items.map(({ link, author, createdAt }) => (
            <li key={link.id} className="break-inside-avoid">
              <Link href={entryHref(link)} className="group flex items-baseline gap-2.5 py-2.5">
                <span aria-hidden className={cn("size-2.5 shrink-0 self-center rounded-[1px]", SQUARE[link.part])} />
                <span className="min-w-0 truncate font-semibold underline-offset-4 group-hover:underline sm:max-w-[20.625rem]">
                  {link.title}
                </span>
                <span aria-hidden className="min-w-5 flex-1 -translate-y-1 border-b-2 border-dotted border-border-strong" />
                <span className="text-sm whitespace-nowrap text-faint-foreground">
                  {[PART_NAME[link.part].one, link.part !== "history_event" && author, createdAt && addedDay(createdAt)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
