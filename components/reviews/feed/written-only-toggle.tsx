"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

// Written only, beside the feed's title: a link to the feed with the filter
// switched, exposed as a switch (Space flips it as well as Enter). Without
// JS it is still the plain link.
export function WrittenOnlyToggle({ on, href }: { on: boolean; href: string }) {
  const router = useRouter();
  return (
    <ButtonLink
      // The page keeps its place: the filter changes the list under it.
      render={<Link href={href} scroll={false} />}
      variant="filter-switch"
      size="bare"
      role="switch"
      aria-checked={on}
      onKeyDown={(event) => {
        if (event.key !== " ") return;
        event.preventDefault();
        router.push(href, { scroll: false });
      }}
      className="mb-0.5 inline-flex items-center"
    >
      Written only
      <span data-part="switch-track" aria-hidden>
        <span data-part="switch-knob" />
      </span>
    </ButtonLink>
  );
}
