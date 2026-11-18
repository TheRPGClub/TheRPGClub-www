import { cn } from "@/lib/utils";

// Secret Santa's picture on its banner (surface brief challenges-assignment):
// twelve small advent doors, dark holly with tinsel edges, the last one open.
export function DoorsPicture() {
  return (
    <div aria-hidden className="grid w-fit grid-cols-[repeat(6,34px)] gap-1.5">
      {Array.from({ length: 12 }, (_, i) => (
        <i
          key={i}
          className={cn(
            "h-[46px] w-[34px] rounded-xs",
            i === 11
              ? "shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--color-tinsel)_50%,transparent)]"
              : "bg-[color-mix(in_srgb,var(--challenge-tint)_55%,var(--color-background))] shadow-[inset_0_0_0_2px_var(--color-tinsel)]",
          )}
        />
      ))}
    </div>
  );
}
