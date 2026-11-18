// Matches the link plugin's own default. Anything else (`javascript:`,
// `data:`, a bare `//host`) is dropped to text.
const ALLOWED_LINK_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

// Anything of the form `scheme:` at the very start, which is what has to be
// checked against the allowlist before the string is handed to `new URL`.
const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:/i;

/**
 * A link target from untrusted JSON, normalized, or null when it is not safe
 * to render as an `href`.
 */
export function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // A NUL can't be stored in a Postgres text or jsonb value.
  const url = raw.replaceAll("\u0000", "").trim();
  if (url.length === 0) return null;

  // Root-relative links stay relative: a link pointing at /games/123
  // shouldn't be rewritten onto a hardcoded absolute host. `//host` is not
  // relative, it's protocol-relative, so it falls through to be resolved.
  // Nor is `/\host` (or `/<tab>/host`): browsers read it as `//host`, so a
  // root-relative link must resolve to this site's own origin to stay one.
  if (url.startsWith("/") && !url.startsWith("//")) {
    return staysOnSite(url) ? url : null;
  }

  // A URL with no scheme is what someone typing "example.com" produces; treat
  // it as https rather than resolving it against this site, which would turn
  // an outbound link into a broken internal one.
  const candidate = SCHEME_PREFIX.test(url)
    ? url
    : `https://${url.replace(/^\/\//, "")}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (!ALLOWED_LINK_SCHEMES.includes(parsed.protocol)) return null;
  // http(s) without a host is not a link to anywhere.
  if (parsed.protocol.startsWith("http") && parsed.hostname.length === 0) {
    return null;
  }
  return parsed.toString();
}

const PROBE_ORIGIN = "https://probe.invalid";

function staysOnSite(path: string): boolean {
  try {
    return new URL(path, PROBE_ORIGIN).origin === PROBE_ORIGIN;
  } catch {
    return false;
  }
}
