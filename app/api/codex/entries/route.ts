import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { isCodexPart } from "@/lib/codex/see-also";

// The See also picker's search (www#127): `GET /codex/entries?q=&part=`
// across the Club Codex's three parts, as the signed-in Member may read
// them. Proxied server-side so apiFetch can attach the session's token.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const part = url.searchParams.get("part");
  const per = Number(url.searchParams.get("per"));

  const qs = new URLSearchParams({ per: String(Number.isInteger(per) && per >= 1 && per <= 25 ? per : 10) });
  if (q) qs.set("q", q);
  if (isCodexPart(part)) qs.set("part", part);

  const res = await apiFetch(`/api/v1/codex/entries?${qs}`, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
