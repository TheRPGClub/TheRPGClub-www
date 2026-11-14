import type { ReactNode } from "react";

// The "Importing <name>" line most kinds show above the review loop.
export function ImportingLine({ prefix = "Importing", name }: { prefix?: string; name: ReactNode }) {
  if (!name) return null;
  return (
    <p className="text-sm text-faint-foreground">
      {prefix} <span className="font-semibold text-foreground">{name}</span>
    </p>
  );
}

// One step of an import's start screen: a numbered heading, what to do, and
// the controls for it.
export function ImportStep({
  step,
  title,
  description,
  children,
}: {
  step?: number;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:p-6">
      {step !== undefined && (
        <span
          aria-hidden
          className="font-headline text-[4.25rem] leading-[0.8] text-muted [-webkit-text-stroke:1.5px_var(--color-faint-foreground)]"
        >
          {step}
        </span>
      )}
      <div className="min-w-0 space-y-4">
        <div className="space-y-1.5">
          <h2 className="font-headline text-[2rem] leading-[0.95]">
            {step !== undefined && <span className="sr-only">Step {step}: </span>}
            {title}
          </h2>
          {description && (
            <p className="max-w-[65ch] text-sm text-dim-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
