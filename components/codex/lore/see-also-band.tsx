import Link from "next/link";
import { funFactPlain } from "@/lib/codex/fun-fact-text";
import { entryHref } from "@/lib/codex/paths";
import { bandLabel } from "@/lib/codex/see-also";
import type { CodexEntry, CodexEntryLink } from "@/lib/codex/types";

// See also on a Lore Entry's page (www#127, design 3D): a full-bleed solid
// jade band with ink type, "See also" in Anton, then each linked entry on a
// 2px ink rule: its chip and date, then a History Event's or Lore Entry's
// title in Anton, or a Fun Fact's text with who added it. Left out when the
// Lore Entry links to nothing.
export function SeeAlsoBand({ items }: { items: readonly { link: CodexEntryLink; entry: CodexEntry | null }[] }) {
  if (items.length === 0) return null;
  return (
    <section
      aria-labelledby="see-also"
      className="-mx-4 grid grid-cols-[minmax(0,1fr)] items-start gap-5 bg-codex-lore px-4 pt-5.5 pb-6.5 text-background sm:-mx-7 sm:px-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7"
    >
      <h2 id="see-also" className="font-headline text-[2rem] leading-[0.88] uppercase lg:text-[2.75rem]">
        See also
      </h2>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-7 gap-y-6 md:grid-cols-2">
        {items.map(({ link, entry }) => (
          <li key={link.id}>
            <SeeAlsoBandLink link={link} entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeeAlsoBandLink({ link, entry }: { link: CodexEntryLink; entry: CodexEntry | null }) {
  const { chip, meta } = bandLabel(link, entry);
  const fact = link.part === "fun_fact";
  return (
    <Link
      href={entryHref(link)}
      className="group block border-t-2 border-background pt-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background"
    >
      <span className="font-label flex flex-wrap items-center gap-2.5 text-[0.8125rem] leading-none font-extrabold tracking-[0.08em] uppercase">
        <i className="rounded-xs bg-background px-1.5 pt-1 pb-0.75 text-codex-lore not-italic">{chip}</i>
        {meta}
      </span>
      {fact ? (
        <>
          <span className="mt-2 block text-[1.03rem] leading-[1.45] font-medium text-pretty group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
            {entry?.body ? funFactPlain(entry.body, entry.mentions, "") : link.title}
          </span>
          {entry && <small className="mt-1.5 block text-[0.84rem] font-semibold text-codex-lore-deep">Added by {entry.author.name}</small>}
        </>
      ) : (
        <b className="font-headline mt-2 block text-[1.625rem] leading-[0.95] font-normal text-balance uppercase group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
          {entry?.title ?? link.title}
        </b>
      )}
    </Link>
  );
}
