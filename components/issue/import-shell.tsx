import type { ReactNode } from "react";
import { PageHeader } from "@/components/issue/page-header";

// The frame every import page shares: the page title on its paper rule (the
// top bar carries the trail back through the member's pages).

export function ImportShell({
  title,
  count,
  description,
  actions,
  children,
}: {
  title: string;
  count?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full space-y-7">
      <div className="space-y-2.5">
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
