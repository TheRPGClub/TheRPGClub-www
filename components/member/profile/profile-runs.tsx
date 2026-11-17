import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProfileRuns as ProfileRunsView } from "@/lib/challenges/profile-runs";
import { DetailSection, SectionLink } from "@/components/templates/detail-template";
import { CurrentStamp } from "@/components/challenges/run-stamp";
import { PastStamp } from "@/components/challenges/past-stamp";
import { RunNoticeProvider, RunNoticeSlot } from "@/components/challenges/run-notice";
import { StampOverflow } from "@/components/member/profile/stamp-overflow";
import { ProfileEmpty } from "@/components/member/profile/profile-empty";

// A member's Runs as a sheet of stamps (surface brief
// challenges-profile-runs, 7C arranged like 7A): up to three current Runs
// large across the top, then the past case with its monumental count and
// the past stamps, newest outcome first. The member deletes an Abandoned Run
// from their own profile. Hidden on someone else's profile with no Runs.
export function ProfileRuns({ runs, isSelf }: { runs: ProfileRunsView; isSelf: boolean }) {
  const { current, past, finished, countLine } = runs;
  const none = current.length + past.length === 0;
  if (none && !isSelf) return null;
  return (
    <DetailSection
      id="runs"
      title="Runs"
      count={none ? undefined : countLine}
      action={<SectionLink href="/challenges">Challenges</SectionLink>}
    >
      {none ? (
        <ProfileEmpty className="mt-4">
          No Runs yet.{" "}
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1 text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
          >
            Find a Challenge <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </ProfileEmpty>
      ) : (
        <RunNoticeProvider>
          {current.length > 0 ? (
            <StampOverflow
              limit={3}
              more="tile"
              className="mt-5 grid grid-cols-1 gap-[26px] px-1 py-1.5 md:grid-cols-2 xl:grid-cols-3"
              items={current.map((stamp) => (
                <CurrentStamp key={stamp.key} stamp={stamp} />
              ))}
            />
          ) : (
            <p className="mt-4 text-faint-foreground">Nothing running right now.</p>
          )}
          {past.length > 0 && (
            <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[170px_minmax(0,1fr)]">
              <div className="flex items-end gap-4 lg:block">
                <p className="font-headline text-[4.5rem] leading-[0.8] lg:text-[5.75rem]">{past.length}</p>
                <div>
                  <h3 className="font-headline mt-1.5 mb-2 text-[1.875rem] leading-[0.9]">Past Runs</h3>
                  <p className="text-sm text-dim-foreground">Newest first. {finished} Finished.</p>
                </div>
              </div>
              <div className="min-w-0">
                <RunNoticeSlot className="mb-6 max-w-md" />
                <StampOverflow
                  limit={10}
                  more="button"
                  className="grid grid-cols-2 gap-[22px] px-1 py-1.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  items={past.map((stamp) => (
                    <PastStamp key={stamp.key} stamp={stamp} canDelete={isSelf && stamp.status === "abandoned"} />
                  ))}
                />
              </div>
            </div>
          )}
        </RunNoticeProvider>
      )}
    </DetailSection>
  );
}
