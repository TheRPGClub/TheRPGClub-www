import { Cake } from "lucide-react";
import { fetchUpcomingBirthdays } from "@/lib/api/birthdays";
import { clubToday } from "@/lib/challenges/dates";
import { avatarSrc, memberAvatarPath } from "@/lib/codex/avatar";
import { birthdayLine } from "@/lib/dashboard/birthdays";
import { PANELS } from "@/lib/dashboard/panels";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PanelItem, PanelWhen } from "./panel-list";
import { listBody, memberHref, RowAvatar } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Upcoming Birthdays (Birthdays spec api#396): the shared Birthdays in the
// next 30 days, soonest first. Today's member is set in Anton behind a
// paper "Today" chip with the cake; the rest by the day it falls on.
export async function BirthdaysBody({ wide }: BodyProps) {
  const upcoming = await fetchUpcomingBirthdays();
  const entries = upcoming && (birthdayLine(upcoming, clubToday()) ?? []);
  return listBody({
    rows: entries,
    title: PANELS.birthdays.title,
    wide,
    row: (entry) => (
      <PanelItem
        key={entry.userId}
        media={<RowAvatar name={entry.name} avatar={avatarSrc(memberAvatarPath(entry.userId))} size={30} />}
        title={
          <span className={cn(entry.today && "font-headline text-[1.375rem] leading-none font-normal")}>{entry.name}</span>
        }
        href={memberHref(entry.userId)}
        aside={
          entry.today ? (
            <Badge tone="inverse" size="sm">
              <Cake aria-hidden />
              Today
            </Badge>
          ) : (
            <PanelWhen>{entry.when}</PanelWhen>
          )
        }
      />
    ),
  });
}
