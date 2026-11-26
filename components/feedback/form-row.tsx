import type { ReactNode } from "react";

// One row of the Give feedback dialog's single column: its caption in label
// caps in the kind's ink (--k), "Optional" on the right when it is, then the
// control. A caption names its control by `htmlFor`, or (`group`) labels a
// group of choices by id.
export function FormRow({
  id,
  label,
  optional = false,
  group = false,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  group?: boolean;
  children: ReactNode;
}) {
  const caption = "font-label text-[0.8rem] leading-none font-bold tracking-[0.06em] text-(--k) uppercase";
  return (
    <div className="border-b border-border px-5 py-3 sm:px-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        {group ? (
          <span id={`${id}-label`} className={caption}>
            {label}
          </span>
        ) : (
          <label htmlFor={id} className={caption}>
            {label}
          </label>
        )}
        {optional && <i className="text-xs text-faint-foreground not-italic">Optional</i>}
      </div>
      {children}
    </div>
  );
}
