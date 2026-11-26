"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// The visit marker (fix pass): on a new visit the page puts the stored News
// Mark in the address (`?mark=`, visitMarkHref) by replacing the history
// entry, so reloads, the live refresh and every link on /news keep the
// visit's new/seen split. Also drops a bad mark from the address.

export function NewsVisitMark({ href }: { href: string | null }) {
  const router = useRouter();
  useEffect(() => {
    if (href) router.replace(href, { scroll: false });
  }, [href, router]);
  return null;
}
