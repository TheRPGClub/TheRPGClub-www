// The completed list's year dial: every year the member finished something
// in, newest first, with the chosen year opened out into its months. A month
// jumps to its frames in the filmstrip (on whichever page they fall). On a
// phone it folds into a wrapping row of years above the spotlight.

import type { YearDialStops } from "@/components/issue/member-year-dial-months";
import { YearRail } from "@/components/issue/member-year-dial-rail";
import { YearRow } from "@/components/issue/member-year-dial-row";

export {
  dialMonths,
  type DialMonth,
  type DialYear,
} from "@/components/issue/member-year-dial-months";

export function YearDial({
  layout = "rail",
  ...stops
}: YearDialStops & {
  // The desktop rail down the right edge, or the phone's row of years.
  layout?: "rail" | "row";
}) {
  return layout === "rail" ? <YearRail {...stops} /> : <YearRow {...stops} />;
}
