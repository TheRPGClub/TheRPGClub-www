// The yellow panel in an Edition's side panel: the viewer's own business
// (DESIGN.md, the Yellow Is Yours Rule). A label line, an Anton line, an
// optional note, then its action.
export function YellowPanel({
  label,
  title,
  note,
  children,
}: {
  label: string;
  title: string;
  note?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-sm bg-highlight px-4 py-3.5 text-highlight-foreground">
      <p className="font-label text-[0.8rem] tracking-[0.08em] text-highlight-muted-foreground">{label}</p>
      <p className="font-headline mt-0.5 mb-2.5 text-[1.625rem] leading-[0.95] text-balance break-words">{title}</p>
      {note && <p className="mb-3 text-[0.9rem] leading-[1.45] text-highlight-muted-foreground">{note}</p>}
      {children}
    </div>
  );
}
