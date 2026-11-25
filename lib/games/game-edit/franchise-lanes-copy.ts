import type { FranchiseRole } from "./franchises";

// The role lanes' words (design pick edit-lanes, www#207).
export const LANE_COPY: Record<FranchiseRole, { title: string; hint: string; empty: string; button: string; move: string }> = {
  mainline: {
    title: "Mainline in",
    hint: "A numbered game in the Franchise",
    empty: "Not Mainline in any Franchise",
    button: "Mainline",
    move: "Move to Mainline in",
  },
  spinoff: {
    title: "Spin-off of",
    hint: "In the Franchise, outside its numbered run",
    empty: "Not a Spin-off in any Franchise",
    button: "Spin-off",
    move: "Move to Spin-off of",
  },
  addon: {
    title: "Add-on of",
    hint: "DLC or an expansion of a game",
    empty: "Not an Add-on of any game",
    button: "Add-on",
    move: "Move to Add-on of",
  },
};
