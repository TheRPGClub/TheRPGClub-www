"use client";

import { createContext, useContext, type ReactNode } from "react";

// Where the Roadmap's Feedback links go: the Feedback Board's href, or null
// when the viewer can't open it. RoadmapPage provides it once for every
// node, read-only or editing.
const BoardHref = createContext<string | null>(null);

export function BoardHrefProvider({ value, children }: { value: string | null; children: ReactNode }) {
  return <BoardHref.Provider value={value}>{children}</BoardHref.Provider>;
}

export const useBoardHref = () => useContext(BoardHref);
