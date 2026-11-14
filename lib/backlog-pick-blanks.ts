import type { BacklogPickPlatform } from "@/lib/api/types";
import { PICK_SOURCES } from "@/lib/api/backlog-pick";

// The choices in the backlog picker's sentence ("I've got [time] on
// [platform]. Deal from my [list]."). A value from the URL that is not one
// of the usual choices stays listed, so the blank can still show it.

export interface BlankItem {
  value: string;
  label: string;
}

const HOUR_STOPS = [5, 10, 15, 20, 30, 40, 60, 80, 100];

export function hourItems(maxHours: number | null): BlankItem[] {
  const stops =
    maxHours !== null && !HOUR_STOPS.includes(maxHours)
      ? [...HOUR_STOPS, maxHours].sort((a, b) => a - b)
      : HOUR_STOPS;
  return [
    { value: "", label: "all the time" },
    ...stops.map((h) => ({
      value: String(h),
      label: `up to ${h} hour${h === 1 ? "" : "s"}`,
    })),
  ];
}

export function platformItems(
  platformId: number | null,
  platforms: BacklogPickPlatform[],
): BlankItem[] {
  const missing =
    platformId !== null && !platforms.some((p) => p.platform_id === platformId);
  return [
    { value: "", label: "any platform" },
    ...(missing ? [{ value: String(platformId), label: `platform #${platformId}` }] : []),
    ...platforms.map((p) => ({
      value: String(p.platform_id),
      label: `${p.platform_name ?? p.platform_abbreviation ?? `Platform #${p.platform_id}`} (${p.count})`,
    })),
  ];
}

export function sourceItems(): BlankItem[] {
  return PICK_SOURCES.map((s) => ({ value: s.value, label: s.label.toLowerCase() }));
}
