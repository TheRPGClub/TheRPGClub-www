import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Form fields in the member pages' voice: a tracked-caps label over an ink
// control. Native selects keep their keyboard and mobile pickers; only the
// chrome is drawn.

export const memberControlClass =
  "h-9.5 w-full min-w-0 rounded-sm border border-rule-strong bg-ink-2 px-2.5 text-sm text-paper caret-highlight [color-scheme:dark] outline-none transition-colors placeholder:text-paper-mute hover:border-paper-mute focus-visible:border-paper-mute focus-visible:ring-2 focus-visible:ring-highlight/40";

export function MemberField({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="font-label text-[0.78rem] font-extrabold tracking-[0.1em] text-paper-mute">
        {label}
      </span>
      {children}
    </label>
  );
}

export function MemberSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        {...props}
        className={cn(memberControlClass, "appearance-none pr-8", className)}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-paper-mute"
      />
    </span>
  );
}
