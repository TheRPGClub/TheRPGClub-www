import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/issue/page-header";

// The frame every import page shares: a breadcrumb trail back through the
// member's pages, then the page title on its paper rule.

export function ImportShell({
  trail,
  title,
  count,
  description,
  actions,
  width = "max-w-6xl",
  children,
}: {
  // Links before the current page, e.g. [["Members", "/members"], …].
  trail: [label: string, href: string][];
  title: string;
  count?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  width?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full ${width} space-y-7`}>
      <div className="space-y-2.5">
        <nav aria-label="Breadcrumb">
          <ol className="font-label flex flex-wrap items-center gap-x-2 text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-mute">
            {trail.map(([label, href]) => (
              <li key={href} className="flex items-center gap-2">
                <Link href={href} className="transition-colors hover:text-paper">
                  {label}
                </Link>
                <span aria-hidden className="text-gotm">
                  /
                </span>
              </li>
            ))}
            <li aria-current="page" className="text-paper">
              {title}
            </li>
          </ol>
        </nav>
        <PageHeader
          title={title}
          count={count}
          description={description}
          actions={actions}
        />
      </div>
      {children}
    </div>
  );
}
