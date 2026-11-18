import { todayLabel, todayRuleAt, type DateGroup } from "@/lib/release-calendar";
import { AgendaGroup, TodayRule } from "./agenda-group";

// A month's (or section's) date groups, with the Today rule set where today
// falls when it is today's month.
export function AgendaGroups({
  groups,
  month,
  today,
}: {
  groups: DateGroup[];
  month: string | null;
  today: string;
}) {
  const ruleAt = todayRuleAt(groups, month, today);
  const rule = <TodayRule key="today" label={todayLabel(today)} />;
  return (
    <>
      {groups.map((group, i) => [
        i === ruleAt ? rule : null,
        <AgendaGroup key={group.key} group={group} today={today} />,
      ])}
      {ruleAt === groups.length && rule}
    </>
  );
}
