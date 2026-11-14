import { NextResponse, type NextRequest } from "next/server";
import { RETURN_TO_HEADER, SESSION_COOKIE, discordSignInUrl } from "@/lib/sign-in";

// Deny by default: every path is for Members unless it is listed here. This
// is an optimistic check on the session cookie only and never calls the API;
// the protected layout's session read stays the authority on who is signed in.

// The files in public/ and the app's metadata files never reach the proxy
// (see the matcher below).
const PUBLIC_PATHS = new Set([
  "/",
  "/join",
  // The join page's Continue (restarts sign-in with the return-to).
  "/join/continue",
]);
const PUBLIC_PREFIXES = ["/auth/"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function returnTo(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  return `${pathname}${search}`;
}

// Lets a Member's request through, telling the protected layout which page
// it was (the layout sends an expired session back through sign-in to it).
function signedIn(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(RETURN_TO_HEADER, returnTo(request));
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();
  if (request.cookies.get(SESSION_COOKIE)?.value) return signedIn(request);

  // The website's own route handlers (the pickers' searches) are fetched by
  // client code, which wants a status it can show, not a sign-in page.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.redirect(discordSignInUrl(returnTo(request)));
}

// Skips Next's internals, the app's metadata files (favicon, icons, the
// manifest) and each file in public/, by name: any other path runs the proxy,
// whatever its extension. A new public file is added here (proxy.test.ts
// reads public/ and app/ and fails until it is). Must stay a literal: Next
// reads it at build time.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|(?:favicon\\.ico|icon\\.svg|icon1\\.png|apple-icon\\.png|manifest\\.webmanifest|logo\\.png|(?:file|globe|next|vercel|window)\\.svg|web-app-manifest-(?:maskable-)?(?:192x192|512x512)\\.png|templates/collection-import-template\\.csv)$).*)",
  ],
};
