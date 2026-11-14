import { NextResponse, type NextRequest } from "next/server";

// Deny by default: every path is for Members unless it is listed here. This
// is an optimistic check on the session cookie only and never calls the API;
// the protected layout's session read stays the authority on who is signed in.

const SESSION_COOKIE = "rpgclub_token";

const PUBLIC_PATHS = new Set([
  "/",
  "/join",
  // App metadata files at the root of app/.
  "/favicon.ico",
  "/icon.svg",
  "/icon1.png",
  "/apple-icon.png",
  "/manifest.webmanifest",
]);
const PUBLIC_PREFIXES = ["/auth/"];
// Images served from public/.
const PUBLIC_IMAGE = /\.(?:png|svg|ico|jpe?g|gif|webp|avif)$/i;

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_IMAGE.test(pathname)
  );
}

function discordSignIn(request: NextRequest) {
  const api = process.env.API_URL ?? "http://localhost:3000";
  const { pathname, search } = request.nextUrl;
  const query = new URLSearchParams({ return_to: `${pathname}${search}` });
  return `${api}/auth/discord?${query}`;
}

export function proxy(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  // The website's own route handlers (the pickers' searches) are fetched by
  // client code, which wants a status it can show, not a sign-in page.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.redirect(discordSignIn(request));
}

// Skips Next's internals and static files (by extension). Must stay a literal:
// Next reads it at build time.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|svg|jpe?g|gif|webp|avif|webmanifest|csv|txt|xml|woff2?)$).*)",
  ],
};
