import { EditSection } from "@/components/games/edit/edit-section";

// A Game Edit tab whose section isn't built yet (www#158-162 fill them in).
export function PlaceholderTab({ title }: { title: string }) {
  return (
    <EditSection title={title}>
      <p className="py-6 text-[0.95rem] text-faint-foreground">Editing {title} comes next.</p>
    </EditSection>
  );
}
