import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SHARE_CARD_FONTS } from "./palette";
import type { ShareCardWinner } from "./select";

// The files the Share Card image draws with. ImageResponse can't use
// next/font or the stylesheet, so the default Theme's faces are read from
// disk as font data (themes/monthly-issue/share-card-fonts, OFL), the logo
// from public/, and each cover is fetched and turned into a PNG data URL
// (covers may be WebP, which the renderer can't read). next.config.ts
// traces these files into the route's function.

const root = process.cwd();
const FONT_DIR = path.join(root, "themes/monthly-issue/share-card-fonts");
const COVER_TIMEOUT_MS = 5_000;
// Twice the largest cover the card draws, for a crisp downscale.
const COVER_WIDTH = 560;

export type ShareCardFontData = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 800;
  style: "normal";
};

async function arrayBuffer(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(file);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

let fonts: Promise<ShareCardFontData[]> | undefined;

// Anton for the headline, Barlow Condensed ExtraBold for labels, Barlow
// Medium for body text: read once per server instance.
export function loadShareCardFonts(): Promise<ShareCardFontData[]> {
  fonts ??= Promise.all([
    arrayBuffer(path.join(FONT_DIR, "Anton-Regular.ttf")).then((data) => ({
      name: SHARE_CARD_FONTS.headline, data, weight: 400 as const, style: "normal" as const,
    })),
    arrayBuffer(path.join(FONT_DIR, "BarlowCondensed-ExtraBold.ttf")).then((data) => ({
      name: SHARE_CARD_FONTS.label, data, weight: 800 as const, style: "normal" as const,
    })),
    arrayBuffer(path.join(FONT_DIR, "Barlow-Medium.ttf")).then((data) => ({
      name: SHARE_CARD_FONTS.body, data, weight: 500 as const, style: "normal" as const,
    })),
  ]).catch((error) => {
    fonts = undefined;
    throw error;
  });
  return fonts;
}

let logo: Promise<string> | undefined;

// The club logo (public/logo.png) as a data URL.
export function loadShareCardLogo(): Promise<string> {
  logo ??= readFile(path.join(root, "public/logo.png"))
    .then((buf) => `data:image/png;base64,${buf.toString("base64")}`)
    .catch((error) => {
      logo = undefined;
      throw error;
    });
  return logo;
}

async function coverDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(COVER_TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) throw new Error(`cover ${res.status}`);
  const { default: sharp } = await import("sharp");
  const png = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: COVER_WIDTH, withoutEnlargement: true })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

// The winners with their covers inlined. Throws when a cover can't be
// fetched or read: the route then sends the brand-only card on a short
// cache rather than cache a round's card for good without its cover. A
// winner whose game has no cover keeps coverUrl null (the card draws its
// title instead), which is final, so that card is cached as usual.
export async function inlineCovers(winners: ShareCardWinner[]): Promise<ShareCardWinner[]> {
  return Promise.all(
    winners.map(async (w) => (w.coverUrl ? { ...w, coverUrl: await coverDataUrl(w.coverUrl) } : w)),
  );
}
