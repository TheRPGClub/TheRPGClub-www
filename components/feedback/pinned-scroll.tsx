"use client";

import { useEffect } from "react";

// Brings the pinned card (`?pinned=<id>`) into view once the board shows it.
export function PinnedScroll({ id }: { id: number }) {
  useEffect(() => {
    if (!id) return;
    const card = document.getElementById(`feedback-${id}`);
    if (!card) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
  }, [id]);
  return null;
}
