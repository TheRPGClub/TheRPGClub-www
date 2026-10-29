import Form from "next/form";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

// The app's running head: the current route as a trail (the @crumbs slot),
// and a games search that lands on /games.
export function TopBar({ trail }: { trail: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-15 shrink-0 items-center gap-4 border-b border-rule bg-ink/95 px-4 backdrop-blur-sm sm:px-7">
      <SidebarTrigger className="-ml-1 md:hidden" />
      {trail}
      <Form
        action="/games"
        role="search"
        className="ml-auto flex h-9 w-36 shrink-0 items-center sm:w-80 gap-2 rounded-sm border border-rule bg-ink-2 px-3 text-paper-mute transition-colors focus-within:border-paper-mute"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <label htmlFor="top-search" className="sr-only">
          Search games
        </label>
        <input
          id="top-search"
          name="q"
          type="search"
          placeholder="Search…"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-paper-mute"
        />
      </Form>
    </header>
  );
}
