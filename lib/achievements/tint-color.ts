// The game tint's colour math: picking a vivid dominant colour from raw
// pixels, making it safe to set type on, and the hashed fallback. Pure, no
// I/O, so client components can call `fallbackTint` too. The server-only
// fetch-and-sample step lives in ./tint.ts.

const INK = "#0b0b0d";
const PAPER = "#f4f4f0";

// A set's tint and the type colour that sits on it (ink or paper, whichever
// clears AA). Always pass both to TintBand: never set type on a tint
// without its contrast colour.
export interface SetTint {
  tint: string;
  contrast: typeof INK | typeof PAPER;
}

// Fallback tints, hashed from the set id. Curated away from the GOTM red
// (#ff0000) and the NR violet, so a game without art never reads as a track.
export const FALLBACK_TINTS: readonly string[] = [
  "#c2452d",
  "#3a7bd5",
  "#b8954a",
  "#d6559b",
  "#5b7c99",
  "#3f8f7a",
  "#6f9a3c",
  "#c46a2a",
  "#2f7f9e",
  "#a0517a",
];

export function fallbackTint(setId: number | string): SetTint {
  const s = String(setId);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  const tint = FALLBACK_TINTS[Math.abs(h) % FALLBACK_TINTS.length];
  return finishTint(hexToRgb(tint));
}

type Rgb = [number, number, number];
type Hsl = [number, number, number]; // h 0-360, s 0-1, l 0-1

// Picks a vivid dominant colour from raw RGB(A) pixels (as sharp's `raw()`
// returns them). Near-black, near-white and grey pixels are skipped; the
// rest vote by hue, weighted by saturation, and the winning hue's pixels are
// averaged. Null when the image has no vivid colour at all.
export function pickVividColor(
  pixels: ArrayLike<number>,
  channels: number,
): SetTint | null {
  const BINS = 24;
  const weight = new Float64Array(BINS);
  const sum = Array.from({ length: BINS }, () => [0, 0, 0]);
  for (let i = 0; i + 2 < pixels.length; i += channels) {
    const rgb: Rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    if (channels === 4 && pixels[i + 3] < 128) continue;
    const [h, s, l] = rgbToHsl(rgb);
    if (l < 0.12 || l > 0.9 || s < 0.25) continue;
    // Mid-lightness, saturated pixels count most.
    const w = s * (1 - Math.abs(l - 0.5));
    const bin = Math.floor(h / (360 / BINS)) % BINS;
    weight[bin] += w;
    sum[bin][0] += rgb[0] * w;
    sum[bin][1] += rgb[1] * w;
    sum[bin][2] += rgb[2] * w;
  }
  let best = -1;
  for (let b = 0; b < BINS; b++) if (weight[b] > (best < 0 ? 0 : weight[best])) best = b;
  if (best < 0) return null;
  const w = weight[best];
  return finishTint([sum[best][0] / w, sum[best][1] / w, sum[best][2] / w]);
}

// Clamps a colour into the tint range (vivid but not neon, mid lightness),
// then darkens it until ink or paper type on it clears 4.5:1.
export function finishTint(rgb: Rgb): SetTint {
  const [h, s0, l0] = rgbToHsl(rgb);
  const s = Math.min(Math.max(s0, 0.35), 0.75);
  let l = Math.min(Math.max(l0, 0.32), 0.62);
  let out = hslToRgb([h, s, l]);
  while (bestContrast(out).ratio < 4.5 && l > 0.2) {
    l -= 0.02;
    out = hslToRgb([h, s, l]);
  }
  return { tint: rgbToHex(out), contrast: bestContrast(out).color };
}

function bestContrast(rgb: Rgb): { color: SetTint["contrast"]; ratio: number } {
  const onInk = contrastRatio(rgb, hexToRgb(INK));
  const onPaper = contrastRatio(rgb, hexToRgb(PAPER));
  return onInk >= onPaper
    ? { color: INK, ratio: onInk }
    : { color: PAPER, ratio: onPaper };
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb: Rgb): string {
  return `#${rgb
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToHsl([r, g, b]: Rgb): Hsl {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
