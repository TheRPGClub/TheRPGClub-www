import { fetchNewsStamp } from "@/lib/api/news";

// The News Feed Stamp for an open News page's poll. It reads no session (the
// API answers it from a file, so Neon can sleep); the proxy still asks for
// the session cookie.
export async function GET() {
  const stamp = await fetchNewsStamp();
  return Response.json(
    stamp === null ? { error: "unavailable" } : { stamp },
    { status: stamp === null ? 502 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
