import type { LucideIcon } from "lucide-react";

// The gradient title + "Round N · Month Year" header above a GOTM / NR-GOTM
// round, shared by the dashboard and the GOTM history archive.
const sectionAccent = {
  brand: {
    icon: "text-brand-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.4)]",
    gradient: "from-brand-200 via-brand-300 to-brand-500",
    underline: "from-brand-500/60 via-brand-500/20 to-transparent",
  },
  purple: {
    icon: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    gradient: "from-purple-200 via-purple-300 to-purple-500",
    underline: "from-purple-500/60 via-purple-500/20 to-transparent",
  },
} as const;

export type SectionAccent = keyof typeof sectionAccent;

export function SectionHeader({
  title,
  round,
  monthYear,
  pickCount,
  accent,
  Icon,
}: {
  title: string;
  round: number;
  monthYear: string;
  pickCount: number;
  accent: SectionAccent;
  Icon: LucideIcon;
}) {
  const style = sectionAccent[accent];
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${style.icon}`} strokeWidth={1.75} />
          <h2
            className={`bg-linear-to-r ${style.gradient} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl`}
          >
            {title}
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Round {round} · {monthYear}
          {pickCount > 1 && ` · ${pickCount} winners`}
        </p>
      </div>
      <div className={`h-px w-full bg-linear-to-r ${style.underline}`} />
    </header>
  );
}
