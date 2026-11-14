import Link from "next/link";
import type { CSSProperties } from "react";
import { PLATFORM_FAMILIES, type PlatformFamily } from "@/lib/giveaways";
import { cn } from "@/lib/utils";

// The shelf's platform filter: All, then each platform family in its ribbon
// ink with its key count (Other only when it holds keys). The picked one is
// filled.
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
    <nav aria-label="Platforms" className="flex flex-wrap gap-2">
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
      style={ink ? ({ "--p": ink } as CSSProperties) : undefined}
      className={cn(
        "font-label inline-flex h-8 items-center gap-2 rounded-sm px-3 text-[0.88rem] font-extrabold transition-colors",
        !ink && (active ? "bg-card text-foreground shadow-[inset_0_0_0_2px_var(--color-highlight)]" : "bg-card text-dim-foreground hover:text-foreground"),
        ink && (active ? "bg-(--p) text-background" : "text-dim-foreground shadow-[inset_0_0_0_1.5px_var(--p)] hover:text-foreground"),
        count === 0 && !active && "opacity-60",
      )}
    >
      {label}
      <b className="font-extrabold opacity-65">{count}</b>
    </Link>
  );
}
