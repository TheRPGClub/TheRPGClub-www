// A front-page section's title: the headline voice over a heavy rule.
export function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-headline border-b-2 border-foreground pb-3 text-[2.15rem] sm:text-[2.9rem]"
    >
      {children}
    </h2>
  );
}
