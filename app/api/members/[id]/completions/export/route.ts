import { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";

// The CSV download is a plain <a download> link, so the browser hits this
// route directly. It can't attach the HttpOnly session token itself; apiFetch
// reads the cookie server-side and sends the bearer header for it.
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/members/[id]/completions/export">,
) {
  const { id } = await ctx.params;

  // The API enforces owner-only too; checking here avoids a round trip and
  // keeps a non-owner from ever reaching it through us.
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (session.principal.discord_id !== id) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const res = await apiFetch(
    `/api/v1/users/${encodeURIComponent(id)}/completions/export`,
    { cache: "no-store", headers: { Accept: "text/csv" } },
  );

  if (!res.ok) {
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "text/plain",
      },
    });
  }

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "text/csv",
      "Content-Disposition":
        res.headers.get("Content-Disposition") ??
        'attachment; filename="completions.csv"',
      "Cache-Control": "no-store",
    },
  });
}
