import "server-only";
import { unstable_cache } from "next/cache";
import { fallbackTint, pickVividColor, type SetTint } from "./tint-color";

export type { SetTint } from "./tint-color";

// A set's game tint, sampled from its cover (preferred) or its set icon:
// the image is fetched, downsized with sharp and its vivid dominant colour
// picked (see pickVividColor). Each image's result is cached by URL for 30
// days. With no usable image the tint is hashed from the set id. Never
// throws.
export async function getSetTint({
  coverUrl,
  iconUrl,
  setId,
}: {
  coverUrl?: string | null;
  iconUrl?: string | null;
  setId: number | string;
}): Promise<SetTint> {
  for (const url of [coverUrl, iconUrl]) {
    if (!url) continue;
    try {
      const tint = await sampleCached(url);
      if (tint) return tint;
    } catch {
      // Unreachable or unreadable image: try the next one, uncached, so a
      // transient failure is retried on the next render.
    }
  }
  return fallbackTint(setId);
}

const MAX_BYTES = 8 * 1024 * 1024;

// Throws on a fetch or decode failure (not cached); returns null for an
// image with no vivid colour (cached, it won't change).
async function sampleImage(url: string): Promise<SetTint | null> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`tint: ${res.status} for ${url}`);
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) throw new Error(`tint: ${url} is too large`);
  const input = Buffer.from(await res.arrayBuffer());
  if (input.byteLength > MAX_BYTES) throw new Error(`tint: ${url} is too large`);
  // Loaded here, not at the top: a missing native binary then rejects inside
  // getSetTint's try and falls back to the hashed tint instead of failing the
  // whole route at module load.
  const { default: sharp } = await import("sharp");
  const { data, info } = await sharp(input)
    .resize(48, 48, { fit: "cover" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return pickVividColor(data, info.channels);
}

const sampleCached = unstable_cache(sampleImage, ["achievement-set-tint-v1"], {
  revalidate: 60 * 60 * 24 * 30,
});
