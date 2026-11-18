import type { ReactNode } from "react";
import type { CodexEntry } from "@/lib/codex/types";
import { dateStamp } from "@/lib/codex/codex-date";
import { titleLines } from "@/lib/codex/lore-story";
import { addedOn } from "@/lib/codex/wall";
import { LoreAuthor } from "./lore-author";

// The Lore Entry's masthead (3D): its title in Anton at feature scale, the
// second line in Club Lore jade, the date pressed on as a rotated stamp, and
// under the rule the byline with Edit and Delete for those allowed.
export function LoreMasthead({ entry, actions }: { entry: CodexEntry; actions?: ReactNode }) {
  const [first, second] = titleLines(entry.title ?? "");
  const stamp = dateStamp(entry.occurred_on, entry.date_precision);
  return (
    <header>
      <div className="grid items-end gap-x-7 gap-y-4 border-b-2 border-foreground pb-4.5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <h1 className="font-headline text-[3rem] leading-[0.86] text-balance break-words sm:text-[4.5rem] xl:text-[6rem]">
          {first}
          {second && (
            <>
              <br />
              <span className="text-codex-lore">{second}</span>
            </>
          )}
        </h1>
        {stamp && (
          <div className="justify-self-start text-center sm:mr-2 sm:mb-2 sm:justify-self-end">
            <p className="font-headline inline-block -rotate-6 rounded-[2px] px-3.5 py-2.5 text-[1.25rem] leading-[0.95] text-codex-lore shadow-[inset_0_0_0_2px_var(--color-codex-lore)] sm:text-[1.625rem]">
              {stamp.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="font-label mt-1 block text-[0.75rem] font-extrabold tracking-[0.08em]">{stamp.note}</span>
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.9375rem] text-dim-foreground">
        <LoreAuthor member={entry.author} lead="Told by" size={28} />
        <p className="font-label ml-auto text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground">
          Club Lore · added {addedOn(entry.created_at)}
        </p>
        {actions}
      </div>
    </header>
  );
}
