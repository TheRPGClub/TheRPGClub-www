import { NextRequest, NextResponse } from "next/server";
import { RETURN_TO_PARAM, safeReturnTo } from "@/lib/return-to";
import {
  AUTH_FAILED_PATH,
  DEFAULT_DESTINATION,
  JOIN_RETRY_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/sign-in";

// The end of Discord sign-in: the API sends the session token here. The
// Member lands where they were going when the return-to is a same-origin
// path, and on the dashboard otherwise.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token");

  if (!token) {
    return NextResponse.redirect(new URL(AUTH_FAILED_PATH, request.url));
  }

  const destination = safeReturnTo(params.get(RETURN_TO_PARAM)) ?? DEFAULT_DESTINATION;
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // Signed in, so any second try on /join is over.
  if (request.cookies.has(JOIN_RETRY_COOKIE)) {
    response.cookies.delete(JOIN_RETRY_COOKIE);
  }

  return response;
}
