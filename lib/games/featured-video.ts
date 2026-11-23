// A game's Featured Video link as something a page can embed: YouTube
// links (watch, youtu.be, embed, shorts) become a privacy-enhanced embed
// URL; anything else stays a plain link. Client-safe.

const ID = /^[\w-]{6,20}$/;

export function youTubeId(link: string | null | undefined): string | null {
  if (!link) return null;
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, rest] = url.pathname.split("/");
    id = kind === "watch" ? url.searchParams.get("v") : kind === "embed" || kind === "shorts" ? rest : null;
  }
  return id && ID.test(id) ? id : null;
}

export function featuredVideoEmbed(link: string | null | undefined): string | null {
  const id = youTubeId(link);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
