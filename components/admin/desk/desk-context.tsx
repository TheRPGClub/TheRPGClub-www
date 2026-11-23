"use client";

import { createContext, useContext } from "react";
import type { JobsShow } from "@/lib/desk-tabs";

// The Staff desk's shared state: which jobs Bot jobs shows, and a way for a
// card or a link inside a tab to open Bot jobs (on a filter) in place.
export interface DeskState {
  show: JobsShow;
  setShow: (show: JobsShow) => void;
  openJobs: (show?: JobsShow) => void;
}

export const DeskContext = createContext<DeskState | null>(null);

export function useDesk(): DeskState {
  const desk = useContext(DeskContext);
  if (!desk) throw new Error("useDesk outside the Staff desk");
  return desk;
}
