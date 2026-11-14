// The front page's foot: the club's mark and name.
export function LandingFooter() {
  return (
    <footer className="flex items-center gap-3 border-t border-border px-4 py-5 text-[0.8rem] text-faint-foreground sm:px-10">
      {/* eslint-disable-next-line @next/next/no-img-element -- the small logo at a fixed size; the optimiser adds nothing */}
      <img src="/logo.png" alt="" width={26} height={26} className="size-6.5" />
      The RPG Club · a Discord community
    </footer>
  );
}
