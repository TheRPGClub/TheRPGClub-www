import { apiFetch } from "@/lib/api";
import { versionsValue, type Versions } from "@/lib/patch-notes/versions";

// The current versions (GET /api/v1/versions, spec api#510): public and
// never Feature-gated. Null until versioning starts or when the read fails;
// either way the versions just don't show. Never cached, as the Patches.
export async function fetchVersions(): Promise<Versions | null> {
  try {
    const res = await apiFetch("/api/v1/versions", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: unknown };
    return versionsValue(body.data);
  } catch {
    return null;
  }
}
