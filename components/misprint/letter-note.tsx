import type { ReactNode } from "react";

// The letters page's note pinned over a misprinted page: the reader's letter
// (what went wrong, in their words), signed with the address they tried, and
// the editor's reply (what to do about it). Paper with ink type, pinned at a
// tilt with a strip of tape, as the Notice Slip is.
export function LetterNote({
  letter,
  address,
  reply,
  action,
  footnote,
}: {
  letter: string;
  // The address the reader tried, when it is known.
  address?: string | null;
  reply: ReactNode;
  // An inverse button that recovers ("Try again").
  action?: ReactNode;
  // Small print under the reply (an error's reference).
  footnote?: ReactNode;
}) {
  return (
    <aside
      aria-label="Letters"
      className="relative -rotate-1 rounded-xs bg-foreground px-6 pt-6 pb-6 text-background shadow-[0_24px_60px_rgb(0_0_0/0.6)] sm:-rotate-2 sm:px-7"
    >
      <span aria-hidden className="absolute -top-3 left-1/2 h-6.5 w-28 -translate-x-1/2 rotate-3 bg-foreground/40" />
      <p className="font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-background/60 uppercase">Letters</p>
      <blockquote className="mt-2.5 text-[1.1rem] leading-normal font-medium italic sm:text-[1.2rem]">
        &ldquo;{letter}&rdquo;
      </blockquote>
      <p className="font-label mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] font-bold tracking-[0.08em] text-background/70 uppercase">
        <span>
          <strong className="font-extrabold text-background">You</strong>, just now
        </span>
        {address && <span className="rounded-xs bg-background/8 px-1.5 py-0.5 break-all normal-case">{address}</span>}
      </p>
      <div className="mt-4.5 border-t-2 border-background pt-3.5">
        <p className="font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-background/60 uppercase">
          The editor replies
        </p>
        <div className="mt-2 text-base leading-normal text-background/80 [&_strong]:font-semibold [&_strong]:text-background">
          {reply}
        </div>
        {action && <div className="mt-4">{action}</div>}
        {footnote && <p className="font-label mt-3 text-[0.72rem] font-bold tracking-[0.08em] text-background/60 uppercase">{footnote}</p>}
      </div>
    </aside>
  );
}
