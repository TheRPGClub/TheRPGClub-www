import { cn } from "@/lib/utils";

// One row of the member's Feature Preferences: the Feature's name (dimmed
// while hidden) with its badge, where it shows up, the switch on the right,
// the save error under it and any sub-settings that belong to the row.
export function PreferenceRow({
  id,
  name,
  badge,
  where,
  dim,
  error,
  className,
  nested,
  children,
}: {
  id: string;
  name: string;
  badge: React.ReactNode;
  where: string;
  dim: boolean;
  error?: string;
  className?: string;
  // Sub-settings that belong to this row, under its error line.
  nested?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className={cn("border-b border-border py-3.5", className)}>
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span
              id={`pref-${id}-name`}
              className={cn(
                "font-label text-[0.95rem] font-bold transition-colors",
                dim ? "text-dim-foreground" : "text-foreground",
              )}
            >
              {name}
            </span>
            {badge}
          </div>
          <p id={`pref-${id}-where`} className="mt-0.5 text-sm text-dim-foreground">
            {where}
          </p>
        </div>
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {nested}
    </li>
  );
}
