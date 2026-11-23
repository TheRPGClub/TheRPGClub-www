import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

// A Draft lying in the pile: a page of `card` stock with its top right corner
// turned down, the fold showing yellow underneath. The cut takes whatever
// ground the page lies on (the tray, the page), and the soft shadow sits on
// a wrapper so the cut doesn't clip it. `edges` lays up to three more pages
// under it, offset down and right, one per extra Draft.
export function DraftPaper({
  fold = 22,
  edges = 0,
  edgeStep = 5,
  className,
  children,
}: {
  // The fold's size in px.
  fold?: number;
  edges?: number;
  edgeStep?: number;
  // Layout classes for the page itself (padding, flex).
  className?: string;
  children: ReactNode;
}) {
  const shown = Math.min(Math.max(edges, 0), 3);
  const style = { "--fold": `${fold}px` } as CSSProperties;
  return (
    <div
      className="relative h-full drop-shadow-[0_6px_14px_rgb(0_0_0/0.4)]"
      style={shown ? { paddingRight: shown * edgeStep, paddingBottom: shown * edgeStep } : undefined}
    >
      {Array.from({ length: shown }, (_, i) => shown - i).map((n) => (
        <i
          key={n}
          aria-hidden
          className="absolute rounded-[2.4px] bg-card shadow-[inset_0_0_0_1px_var(--border-strong)]"
          // The same size as the top page, n steps down and right.
          style={{
            top: n * edgeStep,
            left: n * edgeStep,
            right: (shown - n) * edgeStep,
            bottom: (shown - n) * edgeStep,
          }}
        />
      ))}
      <div
        style={style}
        className={cn(
          "relative rounded-[2.4px] bg-card shadow-[inset_0_0_0_1px_var(--border-strong)] [clip-path:polygon(0_0,calc(100%-var(--fold))_0,100%_var(--fold),100%_100%,0_100%)]",
          className,
        )}
      >
        <i
          aria-hidden
          className="absolute top-0 right-0 size-(--fold) bg-highlight [clip-path:polygon(0_0,0_100%,100%_100%)]"
        />
        {children}
      </div>
    </div>
  );
}
