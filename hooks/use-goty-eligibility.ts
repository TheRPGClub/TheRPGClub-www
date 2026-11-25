"use client";

import { useEffect, useState } from "react";
import { gotyEligibilityAction } from "@/app/actions/goty";
import type { GotyEligibility } from "@/lib/goty/types";

// Each search result's Game of the Year eligibility for the year, checked
// once per game (the answers are kept across searches). A game not checked
// yet, or whose check failed, is absent.
export function useGotyEligibility(year: number, gameIds: number[]) {
  const [checked, setChecked] = useState<Record<number, GotyEligibility>>({});
  const key = gameIds.join(",");

  useEffect(() => {
    const missing = key ? key.split(",").map(Number).filter((id) => !(id in checked)) : [];
    if (!missing.length) return;
    let live = true;
    gotyEligibilityAction(year, missing).then((found) => {
      if (live) setChecked((prev) => ({ ...prev, ...found }));
    });
    return () => {
      live = false;
    };
    // `checked` is read to skip known games, not to re-run on every answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run per result set only
  }, [year, key]);

  return checked;
}
