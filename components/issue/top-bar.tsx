import { SidebarTrigger } from "@/components/ui/sidebar";

// The app's running head: the current route as a trail (the @crumbs slot),
// across the full width. Game search lives on /games itself.
export function TopBar({ trail }: { trail: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-15 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-7">
      <SidebarTrigger className="-ml-1 md:hidden" />
      {trail}
    </header>
  );
}
