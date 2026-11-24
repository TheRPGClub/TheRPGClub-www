import type { Platform } from "@/lib/api/types";
import type { ListOption } from "../member-shelf/list-option-select";

// A shelf form's platform choices: none first, then the club's platforms.
export function platformItems(platforms: readonly Platform[]): ListOption<number | null>[] {
  return [
    { value: null, label: "No platform" },
    ...platforms.map((p) => ({ value: p.platform_id, label: p.platform_name })),
  ];
}
