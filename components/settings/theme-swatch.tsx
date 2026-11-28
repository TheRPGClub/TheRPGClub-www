import { aeroFonts } from "@/themes/aero/fonts";
import { monthlyIssueFonts } from "@/themes/monthly-issue/fonts";

// A Theme picker card's cover (ticket www#250, sketch A "Cover pair"): a
// tiny page drawn under that Theme's own data-theme, so every colour, radius
// and typeface comes from the Theme's tokens rather than from this markup:
// the ground, a card holding a headline and two lines of type, the GOTM and
// NR-GOTM chips, and a call-to-action button. Each part has a slot, so a
// Theme also draws its swatch's shapes and scene (scoped to the swatch's
// own data-theme, never the page's). A Theme whose stylesheet this
// website doesn't load yet sets no tokens there, so its swatch falls back to
// the page's own Theme and still draws whole. It is a picture only.

// Each Theme's faces, so a swatch draws in its own Theme's type on any page
// (the root layout loads only the page's Theme's fonts).
const FONTS: Record<string, string> = { "monthly-issue": monthlyIssueFonts, aero: aeroFonts };

export function ThemeSwatch({ theme }: { theme: string }) {
  return (
    <span
      data-theme={theme}
      data-slot="theme-swatch"
      aria-hidden
      className={`@container relative block aspect-[16/10] overflow-hidden bg-background text-foreground ${FONTS[theme] ?? ""}`}
    >
      <span data-slot="theme-swatch-wordmark" className="font-headline absolute top-[7%] left-[7%] text-[6.4cqw] leading-none">
        The <span className="text-gotm">RPG</span> Club
      </span>
      <span className="absolute top-[22%] bottom-[9%] left-[7%] flex w-[55%] flex-col justify-between overflow-hidden bg-card p-[5%]" data-slot="theme-swatch-card">
        <span data-slot="theme-swatch-numeral" className="font-headline text-[15cqw] leading-[0.8] text-gotm">143</span>
        <span className="flex flex-col gap-[0.6cqw]">
          <span className="block h-[2.4cqw] w-[85%] rounded-full bg-card-foreground opacity-80" />
          <span className="block h-[2.4cqw] w-[55%] rounded-full bg-dim-foreground opacity-60" />
        </span>
        <span className="flex gap-[2cqw]">
          <span data-slot="theme-swatch-chip" data-tone="gotm" className="font-label bg-gotm px-[2cqw] py-[0.8cqw] text-[4cqw] leading-none font-bold text-gotm-foreground">
            GOTM
          </span>
          <span data-slot="theme-swatch-chip" data-tone="nr" className="font-label bg-nr px-[2cqw] py-[0.8cqw] text-[4cqw] leading-none font-bold text-nr-foreground">
            NR
          </span>
        </span>
      </span>
      <span data-slot="theme-swatch-side" className="absolute top-[22%] right-[7%] bottom-[9%] left-[66%] flex flex-col gap-[5%]">
        <span className="block h-[5%] rounded-full bg-muted-foreground opacity-60" />
        <span className="block h-[5%] w-[65%] rounded-full bg-muted-foreground opacity-40" />
        <span data-slot="theme-swatch-action" className="font-headline mt-auto flex h-[30%] items-center justify-center bg-highlight text-[5.4cqw] leading-none text-highlight-foreground">
          Vote
        </span>
      </span>
    </span>
  );
}
