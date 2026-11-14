import Link from "next/link";

// The club's name across the top of /join, over the slideshow: the logo and
// the wordmark, linking back to the front page.

export function JoinMasthead() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-15 items-center px-4 sm:px-10">
      <Link
        href="/"
        className="font-headline pointer-events-auto flex items-center gap-3.5 rounded-sm text-[1.35rem] leading-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={30} height={30} className="size-7.5" />
        <span>
          The <span className="text-gotm">RPG</span> Club
        </span>
      </Link>
    </header>
  );
}
