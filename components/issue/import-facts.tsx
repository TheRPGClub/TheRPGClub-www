// Short facts run along one tracked-caps line under the title; a note or a
// problem reads as a sentence below them.
export function DetailList({
  rows,
  note,
  problem,
}: {
  rows: [string, React.ReactNode][];
  note?: string | null;
  problem?: string | null;
}) {
  return (
    <div className="space-y-2">
      <dl className="font-label flex flex-wrap gap-x-5.5 gap-y-1.5 text-[0.85rem] font-extrabold tracking-[0.06em] text-paper-mute">
        {rows.map(([label, value]) => (
          <div key={label} className="flex min-w-0 items-baseline gap-1.5">
            <dt>{label}</dt>
            <dd className="min-w-0 break-words text-paper">{value}</dd>
          </div>
        ))}
      </dl>
      {note && (
        <p className="max-w-[65ch] text-sm text-paper-dim">
          <span className="font-semibold text-paper">Note:</span> {note}
        </p>
      )}
      {problem && (
        <p className="max-w-[65ch] text-sm text-destructive">
          <span className="font-semibold">Problem:</span> {problem}
        </p>
      )}
    </div>
  );
}
