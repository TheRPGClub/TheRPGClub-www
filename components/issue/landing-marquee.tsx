import { cn } from "@/lib/utils";

// The landing's foot: the recent Games of the Month (the public winners
// window), drifting past as a slow row of covers. It only renders with real
// winners: when the public read fails, there is no marquee rather than
// stand-in art. Hover or focus pauses it; reduced motion gets a still,
// scrollable row instead.

export interface LandingMarqueeItem {
  key: string;
  title: string;
  coverUrl: string | null;
  roundNumber: number;
}

// Keyframes live with the component: the global stylesheet is shared and
// this is the only thing that scrolls on its own.
const KEYFRAMES =
  "@keyframes landing-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}";

// Seconds per cover, so a long history drifts at the same pace as a short one.
const SECONDS_PER_ITEM = 4.5;

// Each copy of the row is at least this many covers, so a short history
// still spans a wide screen before it loops.
const MIN_PER_COPY = 16;

export function LandingMarquee({ items: winners }: { items: LandingMarqueeItem[] }) {
  if (winners.length === 0) return null;
  const repeats = Math.ceil(MIN_PER_COPY / winners.length);
  const items = Array.from({ length: repeats }, (_, r) =>
    winners.map((item) => ({ ...item, key: `${item.key}~${r}` })),
  ).flat();
  const duration = `${Math.max(30, items.length * SECONDS_PER_ITEM)}s`;

  return (
    <section
      aria-label="Recent Games of the Month"
      className="group/marquee relative overflow-hidden border-t border-rule bg-ink motion-reduce:overflow-x-auto"
    >
      <style href="landing-marquee" precedence="default">
        {KEYFRAMES}
      </style>
      <div
        style={{ animationDuration: duration }}
        className="flex w-max motion-safe:animate-[landing-marquee_60s_linear_infinite] group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]"
      >
        <MarqueeRow items={items} repeatsFrom={winners.length} />
        {/* The second copy closes the loop; it is decoration only. */}
        <MarqueeRow items={items} hidden className="motion-reduce:hidden" />
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  hidden,
  repeatsFrom,
  className,
}: {
  items: LandingMarqueeItem[];
  hidden?: boolean;
  // Index where a short history starts repeating: those covers are hidden
  // from assistive tech so each winner is announced once.
  repeatsFrom?: number;
  className?: string;
}) {
  return (
    <ul aria-hidden={hidden} className={cn("flex", className)}>
      {items.map((item, i) => (
        <li
          key={item.key}
          aria-hidden={repeatsFrom !== undefined && i >= repeatsFrom ? true : undefined}
          className={cn(
            "relative h-48 w-36 shrink-0 overflow-hidden bg-ink-3 sm:h-52 sm:w-39",
            // A still row lists each winner once.
            repeatsFrom !== undefined && i >= repeatsFrom && "motion-reduce:hidden",
          )}
        >
          {item.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.coverUrl}
              alt={hidden ? "" : item.title}
              className="size-full object-cover brightness-[0.62] contrast-[1.05] grayscale transition-[filter] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:filter-none"
            />
          ) : (
            <span className="font-headline grid size-full place-items-center border-r border-rule p-3 text-center text-xl text-paper-mute">
              {item.title}
            </span>
          )}
          <span className="font-label absolute bottom-0 left-0 bg-ink/85 px-1.5 py-0.5 text-[0.72rem] font-extrabold tracking-[0.08em] text-paper-dim">
            Round {item.roundNumber}
          </span>
        </li>
      ))}
    </ul>
  );
}
