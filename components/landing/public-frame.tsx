import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PublicTopBar } from "@/components/landing/public-top-bar";

// A public page's frame for a Visitor (www#126): the public top bar, the
// page at the app's width, and the front page's foot.
export function PublicFrame({
  current,
  signInHref,
  inviteHref,
  children,
}: {
  current: string;
  signInHref: string;
  inviteHref: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PublicTopBar current={current} signInHref={signInHref} inviteHref={inviteHref} />
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col px-4 py-6 sm:px-7">{children}</main>
      <LandingFooter />
    </div>
  );
}
