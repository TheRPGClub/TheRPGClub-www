import { cn } from "@/lib/utils";

// One of the banner's numbers on its ink plate: Anton over a label, the
// first (days left, or an Edition's lead number) in the tint's hi.
export function Numeral({ value, label, hi = false }: { value: number; label: string; hi?: boolean }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="font-label text-[0.78rem] leading-[1.3] tracking-[0.08em] text-dim-foreground">{label}</dt>
      <dd
        className={cn(
          "font-headline text-[2.6rem] leading-[0.85] sm:text-[3.25rem]",
          hi ? "text-(--challenge-tint-hi)" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
