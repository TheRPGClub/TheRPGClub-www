import { NextRequest, NextResponse } from "next/server";
import { RETURN_TO_PARAM } from "@/lib/return-to";
import {
  JOIN_RETRY_COOKIE,
  JOIN_RETRY_MAX_AGE_SECONDS,
  discordSignInUrl,
} from "@/lib/sign-in";

// The join page's Continue: sign-in starts again with the same return-to, and
// a short-lived cookie tells /join it is a second try if the Visitor is still
// outside the club's server. The API does not change for this.
export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get(RETURN_TO_PARAM);
  const response = NextResponse.redirect(discordSignInUrl(returnTo));
  response.cookies.set(JOIN_RETRY_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: JOIN_RETRY_MAX_AGE_SECONDS,
  });
  return response;
}
