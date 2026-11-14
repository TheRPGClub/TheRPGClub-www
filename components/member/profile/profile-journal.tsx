import Link from "next/link";
import type { MemberProfile } from "@/lib/members/profile-page";
import { chapterHref, journalDate } from "@/lib/journals";
import { DetailSection, SectionLink } from "@/components/templates/detail-template";
import { memberListHref } from "@/lib/members/member-lists";
import { ProfileEmpty } from "@/components/member/profile/profile-empty";

// The member's Game Journal: their newest chapters, one line per game.
export function ProfileJournal({ profile }: { profile: MemberProfile }) {
  const { user, isSelf, journal } = profile;
  const { rows, chapters } = journal;
  return (
    <DetailSection
      id="journal"
      title="Game Journal"
      count={`${chapters} ${chapters === 1 ? "chapter" : "chapters"}`}
      action={
        (chapters > 0 || isSelf) && (
          <SectionLink href={memberListHref(user.user_id, "journal")}>
            {chapters > 0 ? "Open the journal" : "Start your journal"}
          </SectionLink>
        )
      }
      className="space-y-4"
    >
      {rows.length > 0 ? (
        <ol className="grid gap-x-8 sm:grid-cols-2">
          {rows.map((row) => (
            <li key={row.game!.game_id} className="border-b border-border">
              <Link
                href={chapterHref(user.user_id, row.game!.game_id)}
                className="group flex items-baseline gap-3 py-2"
              >
                <span className="font-label min-w-0 flex-1 truncate text-base tracking-[0.04em] group-hover:text-highlight">
                  {row.game!.title}
                </span>
                {row.last_entry_at && (
                  <span className="text-[0.82rem] text-faint-foreground">
                    Last entry {journalDate(row.last_entry_at)}
                  </span>
                )}
                <span className="font-headline text-[1.15rem]">
                  {row.entry_count}
                  <span className="sr-only"> {row.entry_count === 1 ? "entry" : "entries"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <ProfileEmpty>No journal entries yet.</ProfileEmpty>
      )}
    </DetailSection>
  );
}
