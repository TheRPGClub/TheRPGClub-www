import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import type { ImportJob } from "@/lib/api/types";
import {
  IMPORT_KINDS,
  IMPORT_STATUS_LABELS,
  importItemCount,
  importStartedDate,
  type ImportKind,
} from "@/lib/imports/kinds";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

// The member list each kind writes to, named for the row's subtitle.
const AFFECTS_LABEL: Record<string, string> = {
  "collected-games": "Adds to Collection",
  "completed-games": "Adds to Completed",
};

// One import kind on the hub: what it does and the one thing to do next:
// open the import that's running, link the account it reads, or start it.
export function ImportKindRow({
  kind,
  href,
  active,
  blockedBy,
  linkHref,
}: {
  kind: ImportKind;
  href: string;
  active: ImportJob | null;
  blockedBy: string | null;
  linkHref: string;
}) {
  const config = IMPORT_KINDS[kind];
  const affects = AFFECTS_LABEL[config.affects[0] ?? ""];

  return (
    <li className="grid gap-3 border-b border-border py-5.5 md:grid-cols-[17rem_1fr_14rem] md:items-center md:gap-7 lg:grid-cols-[19rem_1fr_14rem]">
      <h2 className="font-headline text-[2.15rem] leading-[0.95]">
        {config.label}
        {affects && (
          <span className="font-label mt-1.5 block text-[0.82rem] font-extrabold tracking-[0.08em] text-faint-foreground">
            {affects}
          </span>
        )}
      </h2>
      <p className="max-w-[60ch] text-[0.92rem] text-dim-foreground">
        {config.description}
      </p>
      <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
        {active ? (
          <>
            <Badge tone="highlight" className="border-0">
              {IMPORT_STATUS_LABELS[active.status] ?? active.status}
            </Badge>
            <small className="text-[0.8rem] text-faint-foreground">
              Started {importStartedDate(active.created_at)} ·{" "}
              {importItemCount(kind, active.total_count)}
            </small>
            <Link
              href={href}
              className="font-label inline-flex items-center gap-1 text-sm font-extrabold text-foreground transition-colors hover:text-highlight"
            >
              Open it <ArrowRight aria-hidden className="size-4 text-gotm" />
            </Link>
          </>
        ) : blockedBy ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[0.82rem] text-dim-foreground">
              <Link2 aria-hidden className="size-3.5 text-highlight" />
              Link {blockedBy} first
            </span>
            <ButtonLink href={linkHref} variant="outline">
              Link account
            </ButtonLink>
          </>
        ) : (
          <ButtonLink href={href} variant="outline">
            Start
            <ArrowRight data-icon="inline-end" />
          </ButtonLink>
        )}
      </div>
    </li>
  );
}
