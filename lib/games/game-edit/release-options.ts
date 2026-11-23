import { apiFetch } from "@/lib/api";
import type { ApiCollection, Platform, Region } from "@/lib/api/types";

// The platforms and regions a Manual Release can be for (www#161), by name.
// Empty lists when they can't be read.

export interface ReleaseOptions {
  platforms: Pick<Platform, "platform_id" | "platform_code" | "platform_name">[];
  regions: Pick<Region, "region_id" | "region_code" | "region_name">[];
}

async function list<T>(path: string): Promise<T[]> {
  try {
    const res = await apiFetch(path, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return ((await res.json()) as ApiCollection<T>).data ?? [];
  } catch {
    return [];
  }
}

export async function fetchReleaseOptions(): Promise<ReleaseOptions> {
  const [platforms, regions] = await Promise.all([
    list<Platform>("/api/v1/platforms?per=500"),
    list<Region>("/api/v1/regions?per=500"),
  ]);
  return {
    platforms: platforms
      .map(({ platform_id, platform_code, platform_name }) => ({ platform_id, platform_code, platform_name }))
      .sort((a, b) => a.platform_name.localeCompare(b.platform_name)),
    regions: regions
      .map(({ region_id, region_code, region_name }) => ({ region_id, region_code, region_name }))
      .sort((a, b) => a.region_name.localeCompare(b.region_name)),
  };
}
