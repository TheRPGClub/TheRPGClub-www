import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { patchPath } from "@/lib/patch-notes/paths";

export interface PatchNeighbour {
  number: number;
  // Its title as shown, when the list was read.
  title: string | null;
}

const LINK =
  "font-label group inline-flex min-h-10 items-center gap-1.5 text-[0.8125rem] font-extrabold tracking-[0.07em] text-foreground underline decoration-border-strong decoration-1 underline-offset-4 transition-colors hover:text-highlight hover:decoration-highlight [&_svg]:size-3.5";

function Step({ to, rel }: { to: PatchNeighbour; rel: "prev" | "next" }) {
  return (
    <Link href={patchPath(to.number)} rel={rel} className={LINK}>
      {rel === "prev" && <ArrowLeft aria-hidden />}
      <span>
        Patch {to.number}
        {to.title && <span className="text-dim-foreground max-sm:hidden"> · {to.title}</span>}
      </span>
      {rel === "next" && <ArrowRight aria-hidden />}
    </Link>
  );
}

// A Patch page's running foot (www#236, from Cover): the previous Patch at
// the left, the next at the right or "Newest Patch" when this is it. The
// centre holds the versions line once versions exist (www#241).
export function PatchFoot({
  previous,
  next,
  middle,
}: {
  previous: PatchNeighbour | null;
  next: PatchNeighbour | null;
  middle?: ReactNode;
}) {
  return (
    <nav aria-label="More Patches" className="bleed mt-14 border-t border-border-strong">
      <div className="mx-auto grid max-w-page grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-2 sm:px-7 md:px-14">
        <div>{previous && <Step to={previous} rel="prev" />}</div>
        <div className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground">{middle}</div>
        <div className="justify-self-end text-right">
          {next ? (
            <Step to={next} rel="next" />
          ) : (
            <span className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground">Newest Patch</span>
          )}
        </div>
      </div>
    </nav>
  );
}
