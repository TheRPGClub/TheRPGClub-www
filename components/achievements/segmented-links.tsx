import Link from "next/link";
import { cn } from "@/lib/utils";

// A row of mutually exclusive links (tabs, a filter, a sort), the current
// one set on paper like the member list switcher. Server-rendered: every
// option is a URL.
export function SegmentedLinks({
  label,
  options,
  size = "md",
  className,
}: {
  // Names the group for assistive tech.
  label: string;
  options: { key: string; label: React.ReactNode; href: string; on: boolean }[];
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-0.5">
        {options.map((option) => (
          <li key={option.key}>
            <Link
              href={option.href}
              aria-current={option.on ? "true" : undefined}
              scroll={false}
              className={cn(
                "font-label inline-flex items-center gap-1.5 rounded-[3px] font-extrabold tracking-[0.06em] transition-colors",
                size === "md" ? "h-9 px-3 text-[1rem]" : "h-7.5 px-2 text-[0.88rem]",
                option.on
                  ? "bg-paper text-ink"
                  : "text-paper-mute hover:bg-ink-3 hover:text-paper",
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
