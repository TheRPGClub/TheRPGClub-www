import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";

// The game tint's two shapes. Tints come from getSetTint (server) or
// fallbackTint (anywhere).

// A 10-14px spine down the left edge of a set's page. The parent must be
// `relative` and pad its content past the spine.
export function TintSpine({
  tint,
  width = 12,
  className,
}: {
  tint: string;
  width?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("absolute inset-y-0 left-0 rounded-l-md", className)}
      style={{ width, background: tint }}
    />
  );
}

// A solid band behind a game's title, its type in the tint's contrast
// colour so it clears AA. Never a gradient.
export function TintBand({
  tint,
  as: Tag = "div",
  className,
  children,
}: {
  tint: SetTint;
  as?: "div" | "h1" | "h2" | "h3" | "span";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn("rounded-md px-4 pt-2.5 pb-1.5", className)}
      style={{ background: tint.tint, color: tint.contrast }}
    >
      {children}
    </Tag>
  );
}
