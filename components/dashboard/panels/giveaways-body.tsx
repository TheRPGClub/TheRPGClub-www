import { ageLabel } from "@/lib/dashboard/panel-items";
import { readGiveaways } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { listBody, RowCover } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Open Giveaways: the keys donated most recently that nobody has claimed
// yet. Claiming happens on the Giveaways page, so every row leads there.
export async function GiveawaysBody({ wide }: BodyProps) {
  const keys = await readGiveaways();
  const now = Date.now();
  return listBody({
    rows: keys,
    title: PANELS.giveaways.title,
    wide,
    row: (key) => {
      const title = key.game?.title ?? key.game_title;
      return (
        <PanelItem
          key={key.key_id}
          media={<RowCover title={title} coverUrl={key.game?.cover_url} />}
          title={title}
          href="/giveaways"
          meta={<MetaParts parts={[key.platform, key.region !== "Unknown" && key.region]} />}
          aside={<PanelWhen>{ageLabel(key.created_at, now)}</PanelWhen>}
        />
      );
    },
  });
}
