import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchCurrentGotmRound } from "@/lib/api/gotm-rounds";
import { GotmRoundBlock } from "@/components/gotm-round-block";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession, type SessionPrincipal } from "@/lib/session";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  // Session first: the current-round read needs auth, so a logged-out render
  // skips it instead of wasting a fetch that can only 401 (see
  // lib/api/gotm-rounds.ts).
  const session = await getSession();
  const round = session ? await fetchCurrentGotmRound() : null;

  // `gotm_rounds/current` is the GOTM round with the same round's NR-GOTM,
  // N/A placeholders already dropped.
  const gotm = round?.gotm?.games.length ? round.gotm : null;
  const nrGotm = round?.nr_gotm?.games.length ? round.nr_gotm : null;

  return (
    <div className="space-y-8">
      {session && <DashboardWelcome principal={session.principal} />}

      {!round || !gotm ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-muted-foreground">No current Game of the Month.</p>
          <ViewHistoryLink />
        </div>
      ) : (
        <>
          <GotmRoundBlock
            kind="gotm"
            roundNumber={round.round_number}
            block={gotm}
            action={<ViewHistoryLink />}
          />
          {nrGotm && (
            <GotmRoundBlock
              kind="nr_gotm"
              roundNumber={round.round_number}
              block={nrGotm}
            />
          )}
        </>
      )}
    </div>
  );
}

function ViewHistoryLink() {
  return (
    <Link
      href="/gotm"
      className="group inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-brand-300 transition-colors hover:text-brand-200"
    >
      View history
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function DashboardWelcome({ principal }: { principal: SessionPrincipal }) {
  const displayName = principal.global_name ?? principal.username;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Welcome back,{" "}
        <span className="bg-linear-to-r from-brand-200 via-brand-300 to-brand-500 bg-clip-text text-transparent">
          {displayName}
        </span>
        <span className="text-brand-400 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]">
          .
        </span>
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening at the club.
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <DashboardCardSkeleton />
      </div>

      <div>
        <DashboardCardSkeleton imageAlign="left" />
      </div>
    </div>
  );
}

function DashboardCardSkeleton({
  imageAlign = "right",
}: {
  imageAlign?: "left" | "right";
}) {
  const left = imageAlign === "left";

  return (
    <div className="relative min-h-56 overflow-hidden rounded-xl border bg-card">
      <Skeleton
        className={`absolute top-0 h-full w-[70%] rounded-none ${
          left ? "left-0" : "right-0"
        }`}
      />
      <div
        className={`relative max-w-[30%] space-y-3 p-6 ${left ? "ml-auto" : ""}`}
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-5/6" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}
