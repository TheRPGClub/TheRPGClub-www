import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  console.log("[auth/callback] token present:", !!token, "length:", token?.length);

  if (!token) {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("rpgclub_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  console.log("[auth/callback] cookie set, redirecting to /profile");
  return response;
}
