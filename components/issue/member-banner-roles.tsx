import { cn } from "@/lib/utils";

// The member's Discord roles as chips; the first (highest) one is solid.
export function BannerRoles({ roles }: { roles: string[] }) {
  return (
    <ul aria-label="Roles" className="mt-3.5 flex flex-wrap gap-1.5">
      {roles.map((role, i) => (
        <li
          key={role}
          className={cn(
            "font-label inline-flex h-6 items-center rounded-xs px-2 text-[0.78rem] font-extrabold tracking-[0.08em]",
            i === 0
              ? "bg-foreground text-background"
              : "text-foreground shadow-[inset_0_0_0_1.5px_var(--color-dim-foreground)]",
          )}
        >
          {role}
        </li>
      ))}
    </ul>
  );
}
