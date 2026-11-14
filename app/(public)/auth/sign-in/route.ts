import { NextRequest, NextResponse } from "next/server";
import { RETURN_TO_PARAM } from "@/lib/return-to";
import {
  AUTH_FAILED_PATH,
  SESSION_COOKIE,
  SIGN_IN_AGAIN_COOKIE,
  SIGN_IN_AGAIN_MAX_AGE_SECONDS,
  discordSignInUrl,
} from "@/lib/sign-in";

// Sign in again after the session lapsed (an expired or revoked token): the
// protected layout and a search's sign-in link send the Member here. The
// stale session cookie goes, and Discord sign-in starts with the return-to.
export async function GET(request: NextRequest) {
  // Signed in moments ago and the session failed again: stop, don't loop.
  if (request.cookies.has(SIGN_IN_AGAIN_COOKIE)) {
    const response = NextResponse.redirect(new URL(AUTH_FAILED_PATH, request.url));
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(SIGN_IN_AGAIN_COOKIE);
    return response;
  }

  const returnTo = request.nextUrl.searchParams.get(RETURN_TO_PARAM);
  const response = NextResponse.redirect(discordSignInUrl(returnTo));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.set(SIGN_IN_AGAIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SIGN_IN_AGAIN_MAX_AGE_SECONDS,
  });
  return response;
}
