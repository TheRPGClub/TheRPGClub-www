import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { hostAvatar, hostName, hostUserId } from "@/lib/challenges/facts";
import { MemberMark } from "@/components/challenges/host-badge";
import { MemberLink } from "@/components/member/member-link";

// The rules row under the banner: the Host's description of the Challenge on
// the left, a fact list on the right (Host, Season or when it's open, how to
// Finish, the Pool), with the Host's and staff's tools above it.
export function ChallengeRules({ page, tools }: { page: ChallengePage; tools?: React.ReactNode }) {
  const { challenge, facts } = page;
  return (
    <section aria-label="Rules" className="grid grid-cols-1 gap-x-9 gap-y-6 pt-[26px] lg:grid-cols-[1.3fr_1fr]">
      <div className="min-w-0 space-y-4">
        {challenge.description ? (
          <p className="max-w-[75ch] leading-[1.55] whitespace-pre-line text-dim-foreground">{challenge.description}</p>
        ) : (
          <p className="text-faint-foreground">The Host hasn&apos;t written anything more about it.</p>
        )}
      </div>
      <div className="space-y-4">
        {tools && <div className="flex flex-wrap justify-start gap-2 lg:justify-end">{tools}</div>}
        <dl className="grid grid-cols-[110px_1fr] gap-x-3.5 gap-y-2 text-[0.95rem]">
          {facts.map((fact) => (
            <div key={fact.term} className="contents">
              <dt className="font-label text-[0.8rem] leading-[1.6] tracking-[0.08em] text-faint-foreground">
                {fact.term}
              </dt>
              <dd className="m-0 flex min-w-0 items-center gap-2">
                {fact.term === "Host" ? (
                  <MemberLink userId={hostUserId(challenge)} className="inline-flex min-w-0 items-center gap-2">
                    <MemberMark
                      name={hostName(challenge)}
                      src={hostAvatar(challenge)}
                      club={challenge.hosted_by_club}
                      size={20}
                    />
                    <span className="min-w-0">{fact.detail}</span>
                  </MemberLink>
                ) : (
                  <span className="min-w-0">{fact.detail}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
