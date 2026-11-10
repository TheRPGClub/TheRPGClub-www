import type { ReactNode } from "react";
import { PageHeader } from "@/components/issue/page-header";

// The frame every import page shares: the page title on its paper rule (the
// top bar carries the trail back through the member's pages).

export function ImportShell({
  title,
  badge,
  count,
  description,
  actions,
  children,
}: {
  title: string;
  badge?: ReactNode;
  count?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-7">
      <PageHeader
        title={title}
        badge={badge}
        count={count}
        description={description}
        actions={actions}
      />
      {children}
    </div>
  );
}
