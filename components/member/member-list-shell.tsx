import Link from "next/link";

export interface MemberListShellProps {
  userId: string;
  displayName: string;
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function MemberListShell({
  userId,
  displayName,
  title,
  count,
  action,
  children,
}: MemberListShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/members" className="hover:text-foreground transition-colors">
          Members
        </Link>
        <span>›</span>
        <Link
          href={`/members/${userId}`}
          className="hover:text-foreground transition-colors"
        >
          {displayName}
        </Link>
        <span>›</span>
        <span className="text-foreground">{title}</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>

      {children}
    </div>
  );
}
