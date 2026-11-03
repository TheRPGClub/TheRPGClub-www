"use client";

import { useIsClient } from "@/hooks/use-is-client";

// The viewer's time zone, for a desk header's side note. Client-only: the
// server doesn't know it.
export function YourZone() {
  const isClient = useIsClient();
  return <b>{isClient ? Intl.DateTimeFormat().resolvedOptions().timeZone : " "}</b>;
}
