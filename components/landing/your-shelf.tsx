import { SectionTitle } from "@/components/landing/section-title";

// What a member keeps on the site, one line per list.

const SHELF = [
  ["Now playing", "Tell the club what you're on, with the platform and a note."],
  ["Completed", "Log finishes, compare completions with another member, and export them."],
  ["Backlog", "Keep a list, then let the backlog picker choose your next game, with HowLongToBeat times."],
  ["Collection", "Import what you own from Steam or a CSV, or bring completions over from Completionator."],
  ["Reviews", "Write reviews with a rating and a scorecard, and read what the club thought."],
] as const;

export function YourShelf() {
  return (
    <section
      aria-labelledby="shelf-title"
      className="border-t border-border px-4 py-12 sm:px-10 sm:py-18"
    >
      <SectionTitle id="shelf-title">Your shelf in the club</SectionTitle>
      <dl className="mt-4 grid gap-x-12 lg:grid-cols-2">
        {SHELF.map(([title, body]) => (
          <div
            key={title}
            className="grid gap-1 border-b border-border py-4.5 sm:grid-cols-[11rem_1fr] sm:gap-5"
          >
            <dt className="font-headline text-[1.6rem] leading-none">{title}</dt>
            <dd className="text-dim-foreground">{body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
