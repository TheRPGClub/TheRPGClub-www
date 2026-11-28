import Link from "next/link";
import { OUTBOUND_LINK } from "./news-outbound";

// The Seen rule between the new items and the seen ones. "+N more new ·
// Show all" sits on its left while the mosaic holds back new items.

const LABEL = "font-label text-[0.8rem] font-bold tracking-[0.08em] uppercase";

export function NewsSeenRule({ more }: { more: { count: number; href: string } | null }) {
  return (
    <div data-slot="news-seen-rule" className="flex items-center gap-3">
      {more && (
        <>
          <Link href={more.href} className={`${LABEL} shrink-0 text-foreground underline decoration-highlight decoration-2 underline-offset-4 ${OUTBOUND_LINK}`}>
            +{more.count} more new · Show all
          </Link>
          <hr aria-hidden className="h-0.5 flex-1 border-0 bg-border-strong" />
        </>
      )}
      <h2 className={`${LABEL} shrink-0 text-dim-foreground`}>Seen</h2>
      <hr aria-hidden className="h-0.5 flex-1 border-0 bg-border-strong" />
    </div>
  );
}
