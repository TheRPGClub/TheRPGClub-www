// This site's own origin ("https://therpgclub.com"), for links that leave
// the site, such as a Club Codex story's links as Discord shows them.
//
// Taken from configuration, never from a request's headers in production:
// a proxy that passes a client's `X-Forwarded-Host` through would let a
// request choose where the links point. `SITE_URL` names it; on Vercel
// without it, the production domain Vercel exposes
// (`VERCEL_PROJECT_PRODUCTION_URL`, a bare host). Only in development does
// the request's host stand in. Null when none is known.

type Env = Readonly<Record<string, string | undefined>>;
type Headers = { get(name: string): string | null };

function origin(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function siteOrigin(env: Env, headers: Headers | null): string | null {
  const configured = origin(env.SITE_URL) ?? origin(env.VERCEL_PROJECT_PRODUCTION_URL);
  if (configured) return configured;
  if (env.NODE_ENV !== "development" || !headers) return null;
  const host = headers.get("host");
  return host ? origin(`${host.startsWith("localhost") ? "http" : "https"}://${host}`) : null;
}
