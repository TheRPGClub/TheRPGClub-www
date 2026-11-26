import type { ReactNode } from "react";
import Link from "next/link";

// The frame for a misprint that happened outside the app shell (a public
// page, or the shell itself failing): the wordmark home and the page, at the
// app's width. No session is read here, so it never fails the same way.
export function BareFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex h-16 items-center border-b border-border px-4 sm:px-7">
        <Link href="/" className="font-headline text-[1.375rem] leading-none uppercase sm:text-[1.625rem]">
          The <span className="text-gotm">RPG</span> Club
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col px-4 py-6 sm:px-7">{children}</main>
    </div>
  );
}
