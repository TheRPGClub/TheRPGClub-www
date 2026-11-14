import Form from "next/form";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";

// The app's running head: the current route as a trail (the @crumbs slot),
// and a games search that lands on /games. No search when the viewer can't
// open Game Index (its results page would be not-found).
export function TopBar({ trail, search }: { trail: React.ReactNode; search: boolean }) {
  return (
    <header className="sticky top-0 z-20 flex h-15 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-7">
      <SidebarTrigger className="-ml-1 md:hidden" />
      {trail}
      {search && (
        <Form
          action="/games"
          role="search"
          className="ml-auto flex h-9 w-36 shrink-0 sm:w-80"
        >
          {/* The group pads its field after an addon; here the gap spaces them. */}
          <InputGroup
            variant="quick-search"
            className="h-full gap-2 px-3 has-[>[data-align=inline-start]]:[&>input]:pl-0"
          >
            <InputGroupAddon className="p-0">
              <Search aria-hidden className="size-4 shrink-0" />
            </InputGroupAddon>
            <Label htmlFor="top-search" variant="field" className="sr-only">
              Search games
            </Label>
            <InputGroupInput
              id="top-search"
              name="q"
              type="search"
              placeholder="Search…"
              className="h-full p-0 text-sm"
            />
          </InputGroup>
        </Form>
      )}
    </header>
  );
}
