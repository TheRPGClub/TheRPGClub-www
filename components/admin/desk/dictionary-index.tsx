import { DICTIONARY_LETTERS } from "@/lib/desk";

// The A to Z jump bar over a dictionary list: a letter with entries links to
// its section, the rest are printed faint. "#" shows only when used.
export function DictionaryIndex({ present }: { present: ReadonlySet<string> }) {
  return (
    <nav aria-label="Jump to a letter" className="mt-4.5 flex flex-wrap gap-0.5">
      {DICTIONARY_LETTERS.filter((l) => l !== "#" || present.has("#")).map((letter) =>
        present.has(letter) ? (
          <a
            key={letter}
            href={`#dict-${letter}`}
            className="font-headline grid size-[30px] place-items-center rounded-xs text-[1.05rem] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {letter}
          </a>
        ) : (
          <span
            key={letter}
            aria-hidden
            className="font-headline grid size-[30px] place-items-center text-[1.05rem] text-faint-foreground/60"
          >
            {letter}
          </span>
        ),
      )}
    </nav>
  );
}
