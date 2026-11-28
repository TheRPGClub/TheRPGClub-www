import type { ReactNode } from "react";

// A card in the desk's drawer (5D): on `muted`, resting at a slight tilt on
// wide screens (flat and full width on phones), its heading in Anton with a
// small note at the right.
export function DrawerCard({
  title,
  note,
  tilt,
  children,
}: {
  title: string;
  note?: ReactNode;
  tilt: number;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      data-slot="drawer-card"
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      className="rounded-md bg-muted px-4.5 py-4"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-headline text-2xl leading-none">{title}</h2>
        {note && <p className="font-label text-[0.75rem] font-bold tracking-[0.08em] text-faint-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}
