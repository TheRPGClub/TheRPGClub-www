// A Theme picker card's cover (ticket www#250, sketch A "Cover pair"): a
// tiny page drawn under that Theme's own data-theme, so every colour, radius
// and typeface comes from the Theme's tokens rather than from this markup:
// the ground, a card holding a headline and two lines of type, the GOTM and
// NR-GOTM chips, and a call-to-action button. A Theme whose stylesheet this
// website doesn't load yet sets no tokens there, so its swatch falls back to
// the page's own Theme and still draws whole. It is a picture only.
export function ThemeSwatch({ theme }: { theme: string }) {
  return (
    <span
      data-theme={theme}
      aria-hidden
      className="@container relative block aspect-[16/10] overflow-hidden rounded-xs bg-background text-foreground inset-ring-1 inset-ring-border"
    >
      <span className="font-headline absolute top-[7%] left-[7%] text-[6.4cqw] leading-none uppercase">
        The <span className="text-gotm">RPG</span> Club
      </span>
      <span className="absolute top-[22%] bottom-[9%] left-[7%] flex w-[55%] flex-col justify-between overflow-hidden rounded-xs bg-card p-[5%]">
        <span className="font-headline text-[15cqw] leading-[0.8] text-gotm">143</span>
        <span className="flex flex-col gap-[0.6cqw]">
          <span className="block h-[2.4cqw] w-[85%] rounded-full bg-card-foreground opacity-80" />
          <span className="block h-[2.4cqw] w-[55%] rounded-full bg-dim-foreground opacity-60" />
        </span>
        <span className="flex gap-[2cqw]">
          <span className="font-label rounded-xs bg-gotm px-[2cqw] py-[0.8cqw] text-[4cqw] leading-none font-bold text-gotm-foreground uppercase">
            GOTM
          </span>
          <span className="font-label rounded-xs bg-nr px-[2cqw] py-[0.8cqw] text-[4cqw] leading-none font-bold text-nr-foreground uppercase">
            NR
          </span>
        </span>
      </span>
      <span className="absolute top-[22%] right-[7%] bottom-[9%] left-[66%] flex flex-col gap-[5%]">
        <span className="block h-[5%] rounded-full bg-muted-foreground opacity-60" />
        <span className="block h-[5%] w-[65%] rounded-full bg-muted-foreground opacity-40" />
        <span className="font-headline mt-auto flex h-[30%] items-center justify-center rounded-sm bg-highlight text-[5.4cqw] leading-none text-highlight-foreground uppercase">
          Vote
        </span>
      </span>
    </span>
  );
}
