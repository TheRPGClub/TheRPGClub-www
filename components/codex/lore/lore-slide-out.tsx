import { ArrowRight, Link2, Pencil } from "lucide-react";
import type { CodexEntry } from "@/lib/codex/types";
import { spineDate } from "@/lib/codex/lore-date";
import { storyOpening } from "@/lib/codex/lore-story";
import { LORE_PATH } from "@/lib/codex/paths";
import { ButtonLink } from "@/components/ui/button";
import { FunFactText } from "@/components/codex/fun-fact-text";
import { LoreAuthor } from "./lore-author";
import { LoreDelete } from "./lore-delete";

// The picked Lore Entry pulled out of the shelf (4D): its date and title,
// the story's opening lines, up to three of its images, who told it, and
// Read it; Edit and Delete for its author or a Moderator.
export function LoreSlideOut({ entry }: { entry: CodexEntry }) {
  const opening = storyOpening(entry.rich_body) || storyOpening([{ type: "p", children: [{ text: entry.body?.split(/\n{2,}/)[0] ?? "" }] }]);
  const date = entry.occurred_on ? spineDate(entry.occurred_on, entry.date_precision) : null;
  const href = `${LORE_PATH}/${entry.id}`;
  return (
    <div className="relative rounded-md bg-card px-6 pt-6.5 pb-5.5 shadow-[inset_0_6px_0_var(--color-codex-lore),0_12px_30px_rgb(0_0_0/0.5)]">
      {date && <p className="font-label text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground">{date}</p>}
      <h2 className="font-headline mt-1.5 text-[2.5rem] leading-[0.92] break-words">{entry.title}</h2>
      {opening && (
        <p className="mt-3.5 leading-[1.55] text-dim-foreground">
          <FunFactText body={opening} mentions={entry.mentions} />
        </p>
      )}
      {entry.images.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {entry.images.slice(0, 3).map((image) => (
            <li key={image.id} className="aspect-square overflow-hidden rounded-[2px] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- an uploaded image on the club's image store, which next/image isn't configured for */}
              <img src={image.url} alt="" loading="lazy" className="size-full object-cover" />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.875rem] text-dim-foreground">
        <span className="flex items-center gap-2">
          <LoreAuthor member={entry.author} size={24} />
        </span>
        {entry.links.length > 0 && (
          <span className="flex items-center gap-1.5 text-faint-foreground">
            <Link2 aria-hidden className="size-4" />
            See also {entry.links.length}
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ButtonLink href={href} variant="outline">
          Read it
          <ArrowRight aria-hidden data-icon="inline-end" />
        </ButtonLink>
        {entry.viewer.can_edit && (
          <ButtonLink href={`${href}/edit`} variant="ghost" size="sm">
            <Pencil aria-hidden />
            Edit
          </ButtonLink>
        )}
        {entry.viewer.can_delete && <LoreDelete id={entry.id} size="sm" quiet />}
      </div>
    </div>
  );
}
