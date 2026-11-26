import { NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

// A member's picture for the browser (lib/members/avatar avatarSrc): a
// redirect to the API's public avatar endpoint, which sends it on to
// Discord's image server or the stored copy. The browser only knows this
// site, so a client component's avatar can't point at the API itself.
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/members/[id]/avatar">) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "not_found" }, { status: 404 });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${API_URL}/api/v1/users/${id}/avatar`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
