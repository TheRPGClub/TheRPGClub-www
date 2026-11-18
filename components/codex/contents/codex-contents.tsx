import type { ReactNode } from "react";
import type { CodexContents as Contents } from "@/lib/codex/contents-page";
import {
  ADD_FUN_FACT_ID,
  FUN_FACTS_PATH,
  HISTORY_PATH,
  LORE_PATH,
  NEW_HISTORY_PATH,
  NEW_LORE_PATH,
  PART_NAME,
} from "@/lib/codex/paths";
import { occurredLabel } from "@/lib/codex/wall";
import { PageHeader } from "@/components/templates/page-header";
import { FunFactText } from "@/components/codex/fun-fact-text";
import { CodexDoor } from "./codex-door";
import { FactBand } from "./fact-band";
import { LatelyList } from "./lately-list";

// The Club Codex contents page (design 1C, www#124): a Fun Fact leads, then a
// door per part in its ink, then the newest entries across all three.
export function CodexContents({
  contents,
  canAdd,
  canAddHistory,
  badge,
}: {
  contents: Contents;
  // Regulars and staff add Lore Entries and Fun Facts; Admins and above
  // History Events.
  canAdd: boolean;
  canAddHistory: boolean;
  badge?: ReactNode;
}) {
  const { doors } = contents;
  const total = doors.history_event.count + doors.lore_entry.count + doors.fun_fact.count;
  const history = doors.history_event.entry;
  const lore = doors.lore_entry.entry;
  const fact = doors.fun_fact.entry;
  const facts = contents.facts;
  const historyDate = history && occurredLabel(history.occurred_on, history.date_precision);

  return (
    <div>
      <PageHeader
        title="Club Codex"
        badge={badge}
        count={`${total} ${total === 1 ? "entry" : "entries"}`}
        description="The club's story about itself, in three parts. Club History is the record; Club Lore is the stories we still tell; Fun Facts are the small things."
      />
      <div className="mt-6">
        <FactBand facts={facts} canAdd={canAdd} />
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <CodexDoor
          ink="bg-codex-history"
          count={doors.history_event.count}
          name={PART_NAME.history_event.section}
          blurb="How the club got here, from the subreddit in 2016 to today. Written by the Admins, and open to Visitors too."
          label={`Latest History Event${historyDate ? ` · ${historyDate}` : ""}`}
          latest={history?.title ?? null}
          empty="No History Events yet."
          openHref={HISTORY_PATH}
          openLabel="Open Club History"
          addHref={canAddHistory ? NEW_HISTORY_PATH : null}
          isPublic
        />
        <CodexDoor
          ink="bg-codex-lore"
          count={doors.lore_entry.count}
          name={PART_NAME.lore_entry.section}
          blurb="The stories we tell about ourselves, told properly this time, with screenshots."
          label={`Newest Lore Entry${lore ? ` · by ${lore.author.name}` : ""}`}
          latest={lore?.title ?? null}
          empty="No Lore Entries yet."
          openHref={LORE_PATH}
          openLabel="Open Club Lore"
          addHref={canAdd ? NEW_LORE_PATH : null}
        />
        <CodexDoor
          ink="bg-codex-fact"
          count={doors.fun_fact.count}
          name={PART_NAME.fun_fact.section}
          blurb="One or two sentences each. The bot posts one in general chat every day at 15:00 New York time."
          label={`Newest Fun Fact${fact ? ` · by ${fact.author.name}` : ""}`}
          latest={fact && <FunFactText body={fact.body ?? ""} mentions={fact.mentions} />}
          empty="No Fun Facts yet."
          openHref={FUN_FACTS_PATH}
          openLabel="Open Fun Facts"
          addHref={canAdd ? `${FUN_FACTS_PATH}#${ADD_FUN_FACT_ID}` : null}
        />
      </div>
      <LatelyList items={contents.lately} />
    </div>
  );
}
