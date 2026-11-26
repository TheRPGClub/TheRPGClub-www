import Link from "next/link";
import type { CSSProperties } from "react";
import { PLATFORM_FAMILIES, type PlatformFamily } from "@/lib/giveaways";
import { cn } from "@/lib/utils";

// The shelf's platform filter: All, then each platform family with a swatch
// of its gift paper and its key count (Other only when it holds keys). The
// picked one stands on a paper underline.
export function PlatformTabs({
  picked,
  total,
  counts,
}: {
  picked: PlatformFamily | null;
  total: number;
  counts: Map<string, number>;
}) {
  return (
    <nav aria-label="Platforms" className="flex flex-wrap gap-x-4 gap-y-1">
      <PlatformTab href="/giveaways" active={!picked} label="All" count={total} />
      {PLATFORM_FAMILIES.filter((f) => f.key !== "other" || counts.has("other")).map((f) => (
        <PlatformTab
          key={f.key}
          href={`/giveaways?platform=${f.key}`}
          active={picked?.key === f.key}
          label={f.label}
          count={counts.get(f.key) ?? 0}
          ink={f.ink}
        />
      ))}
    </nav>
  );
}

function PlatformTab({
  href,
  active,
  label,
  count,
  ink,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  ink?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{ "--p": ink ?? "var(--color-foreground)" } as CSSProperties}
      className={cn(
        "font-label inline-flex h-9 items-center gap-2 border-b-[3px] px-1.5 text-[0.88rem] font-extrabold transition-colors",
        active ? "border-foreground text-foreground" : "border-transparent text-dim-foreground hover:text-foreground",
        count === 0 && !active && "opacity-55",
      )}
    >
      <i aria-hidden className={cn("size-3.5 rounded-xs", ink ? "gift-paper" : "bg-foreground")} />
      {label}
      <b className="font-extrabold text-faint-foreground">{count}</b>
    </Link>
  );
}
