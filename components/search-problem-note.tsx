"use client";

import type { SearchProblem } from "@/lib/search-problem";
import { signInAgainPath } from "@/lib/sign-in";
import { cn } from "@/lib/utils";

// A picker's failed search, under its field. A lapsed session offers to sign
// in again, back to this page (a full load: /auth/sign-in is a route).
export function SearchProblemNote({ problem, className }: { problem: SearchProblem; className?: string }) {
  return (
    <p className={cn("text-xs text-destructive", className)}>
      {problem.message}
      {problem.signIn && (
        <>
          {" "}
          <a href={signInAgainPath(here())} className="font-semibold underline underline-offset-2">
            Sign in again
          </a>
        </>
      )}
    </p>
  );
}

// Only rendered after a search ran in the browser.
function here() {
  return typeof window === "undefined" ? null : `${window.location.pathname}${window.location.search}`;
}
