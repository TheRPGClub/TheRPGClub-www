// The key to the wall's marks.
export function PoolLegend() {
  const item = "inline-flex items-center gap-1.5";
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-faint-foreground sm:ml-auto">
      <span className={item}>
        <i className="size-3.5 rounded-full bg-dim-foreground" />
        Cleared
      </span>
      <span className={item}>
        <i className="size-3.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--color-foreground)]" />
        In Progress
      </span>
      <span className={item}>
        <i className="size-3.5 rounded-xs shadow-[inset_0_0_0_1.5px_var(--color-highlight)]" />
        In your Run
      </span>
      <span className={item}>
        <i className="size-3.5 rounded-xs bg-muted" />
        Not played yet
      </span>
    </p>
  );
}
