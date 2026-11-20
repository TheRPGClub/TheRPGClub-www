import Image from "next/image";
import Link from "next/link";

// The app's running head: the current route as a trail (the @crumbs slot),
// across the full width. Game search lives on /games itself. On phones,
// where the tab bar stands in for the sidebar, the club's mark leads the
// trail and the member's account menu (`account`) closes the line.
export function TopBar({ trail, account }: { trail: React.ReactNode; account?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-15 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-7">
      <Link href="/dashboard" aria-label="Dashboard" className="shrink-0 md:hidden">
        <Image src="/logo.png" alt="" width={32} height={32} priority className="size-8" />
      </Link>
      <div className="min-w-0 flex-1">{trail}</div>
      {account && <div className="shrink-0 md:hidden">{account}</div>}
    </header>
  );
}
