import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/codex/history", label: "History" },
] as const;

// The public pages' top bar (design 2B, www#126), for Visitors: the
// wordmark, Home and History with the current one underlined in masthead
// red, then Sign in with Discord and the yellow Join the Discord.
export function PublicTopBar({
  current,
  signInHref,
  inviteHref,
}: {
  current: string;
  signInHref: string;
  inviteHref: string;
}) {
  return (
    <header className="flex h-16 items-center gap-x-3 border-b border-border px-4 sm:gap-x-6.5 sm:px-7">
      <Link href="/" className="font-headline shrink-0 text-[1.375rem] leading-none uppercase sm:text-[1.625rem]">
        The <span className="text-gotm">RPG</span> Club
      </Link>
      <nav aria-label="The RPG Club" className="hidden gap-1 sm:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.href === current ? "page" : undefined}
            className={cn(
              "font-label px-2.5 py-2.5 text-[0.9375rem] leading-none font-bold tracking-[0.08em] text-dim-foreground uppercase transition-colors hover:text-foreground",
              item.href === current && "text-foreground shadow-[inset_0_-2px_0_var(--color-gotm)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <ButtonLink render={<a />} href={signInHref} variant="outline" size="sm">
          Sign in<span className="hidden md:inline">with Discord</span>
        </ButtonLink>
        <ButtonLink render={<a />} href={inviteHref} variant="highlight" size="sm">
          Join<span className="hidden md:inline">the Discord</span>
        </ButtonLink>
      </div>
    </header>
  );
}
