import Form from "next/form";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

// The app's running head: which issue (GOTM round) the club is on, and a
// games search that lands on /games. The issue line drops out when no round
// has been decided yet or the read failed.
export function TopBar({
  issue,
}: {
  issue: { roundNumber: number; monthYear: string } | null;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-15 shrink-0 items-center gap-4 border-b border-rule bg-ink/95 px-4 backdrop-blur-sm sm:px-7">
      <SidebarTrigger className="-ml-1 md:hidden" />
      {issue && (
        <p className="font-label truncate text-[0.95rem] font-bold tracking-[0.08em] text-paper-mute">
          <span className="text-paper">Issue {issue.roundNumber}</span>
          <span aria-hidden className="mx-2 text-gotm">
            /
          </span>
          {issue.monthYear}
        </p>
      )}
      <Form
        action="/games"
        role="search"
        className="ml-auto flex h-9 w-full max-w-80 items-center gap-2 rounded-sm border border-rule bg-ink-2 px-3 text-paper-mute transition-colors focus-within:border-paper-mute"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <label htmlFor="top-search" className="sr-only">
          Search games
        </label>
        <input
          id="top-search"
          name="q"
          type="search"
          placeholder="Search games…"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-paper-mute"
        />
      </Form>
    </header>
  );
}
