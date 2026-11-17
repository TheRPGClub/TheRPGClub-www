import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// The form's live Pool preview: the games a draft Pool definition resolves
// to, run server-side so apiFetch can attach the session.
export async function POST(req: NextRequest) {
  const per = new URL(req.url).searchParams.get("per") ?? "500";
  const res = await apiFetch(`/api/v1/challenges/pool_preview?${new URLSearchParams({ per })}`, {
    method: "POST",
    body: await req.text(),
    cache: "no-store",
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
