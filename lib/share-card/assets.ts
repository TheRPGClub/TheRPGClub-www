import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { coverCrop, SHARE_CARD_ART } from "./crop";
import { SHARE_CARD_FONTS } from "./palette";
import type { ShareCardWinner } from "./select";

// The files the Share Card image draws with. ImageResponse can't use
// next/font or the stylesheet, so the default Theme's faces are read from
// disk as font data (themes/monthly-issue/share-card-fonts, OFL), the logo
// from public/, and each cover and the GOTM's key art are fetched and turned
// into PNG data URLs (they may be WebP, which the renderer can't read). next.config.ts
// traces these files into the route's function.

const root = process.cwd();
const FONT_DIR = path.join(root, "themes/monthly-issue/share-card-fonts");
const IMAGE_TIMEOUT_MS = 5_000;
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

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) throw new Error(`image ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function pngDataUrl(png: Buffer): string {
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function coverDataUrl(url: string): Promise<string> {
  const { default: sharp } = await import("sharp");
  const png = await sharp(await fetchImage(url))
    .resize({ width: COVER_WIDTH, withoutEnlargement: true })
    .png()
    .toBuffer();
  return pngDataUrl(png);
}

// The key art, scaled and cut to exactly the box the card draws it in
// (crop.ts): no object-position needed, and a small image to render.
async function artDataUrl(url: string): Promise<string> {
  const { default: sharp } = await import("sharp");
  const input = await fetchImage(url);
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) throw new Error(`art unreadable: ${url}`);
  const box = { width: SHARE_CARD_ART.width, height: SHARE_CARD_ART.height };
  const crop = coverCrop({ width: meta.width, height: meta.height }, box, SHARE_CARD_ART.position);
  const png = await sharp(input)
    .resize({ width: crop.width, height: crop.height, fit: "fill" })
    .extract({ left: crop.left, top: crop.top, ...box })
    .png()
    .toBuffer();
  return pngDataUrl(png);
}

// The winners with their images inlined, and whether the card came out
// whole.
// - A cover that can't be fetched or read throws: the route then sends the
//   brand-only card on a short cache rather than cache a round's card for
//   good without its cover.
// - A winner whose game has no cover keeps coverUrl null (the card draws its
//   title instead); that is final, so the card is cached as usual.
// - Only the GOTM's key art is used. When it fails to load the card stands
//   the covers instead ("The Winners' Stand") and `complete` is false, so
//   the route caches it briefly and "The Cover" lands later.
export async function inlineImages(
  winners: ShareCardWinner[],
): Promise<{ winners: ShareCardWinner[]; complete: boolean }> {
  let complete = true;
  const inlined = await Promise.all(
    winners.map(async (w) => {
      const coverUrl = w.coverUrl ? await coverDataUrl(w.coverUrl) : null;
      let artUrl: string | null = null;
      if (w.kind === "gotm" && w.artUrl) {
        artUrl = await artDataUrl(w.artUrl).catch((error) => {
          console.error("share card: key art failed, standing the covers", error);
          complete = false;
          return null;
        });
      }
      return { ...w, coverUrl, artUrl };
    }),
  );
  return { winners: inlined, complete };
}
