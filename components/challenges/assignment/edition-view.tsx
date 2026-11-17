import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { editionDoors, editionNumerals } from "@/lib/challenges/edition";
import { calendarStrip, editionRules } from "@/lib/challenges/edition-calendar";
import type { EditionPage } from "@/lib/challenges/edition-page";
import { tintStyle } from "@/lib/challenges/tint";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { ChallengeBanner } from "@/components/challenges/challenge-banner";
import { AdventDoors } from "@/components/challenges/assignment/advent-doors";
import { DecemberStrip } from "@/components/challenges/assignment/december-strip";
import { EditionPanel } from "@/components/challenges/assignment/edition-panel";
import { EditionSwitcher } from "@/components/challenges/assignment/edition-switcher";

// An Assignment (Secret Santa) Challenge's page (surface brief
// challenges-assignment, 4A with 4D as an accent): the banner in holly with
// the Edition's numerals, the rules told from its calendar, the December
// strip, then the advent doors beside the side panel (above them on phones,
// the viewer's business first). The doors open as the Edition moves on.
export function EditionView({
  page,
  data,
  badge,
  tools,
  notice,
}: {
  page: ChallengePage;
  data: EditionPage;
  badge?: React.ReactNode;
  tools?: React.ReactNode;
  notice?: React.ReactNode;
}) {
  const { challenge } = page;
  const edition = data.edition;
  const calendar = edition
    ? {
        cutoff: edition.signup_cutoff_on.slice(5),
        deadline: edition.pick_deadline_on.slice(5),
        reveal: edition.reveal_on.slice(5),
      }
    : data.calendar;
  const { doors, yourSeat } = edition ? editionDoors(edition, data.viewerId, data.today) : { doors: [], yourSeat: false };
  return (
    <div style={tintStyle(page.tint)} className="pb-12">
      <ChallengeBanner
        page={page}
        badge={badge}
        chip={edition ? `Edition ${edition.year}` : undefined}
        numerals={edition ? editionNumerals(edition, data.today) : []}
        hostChip
      />
      {notice}
      <section aria-label="Rules" className="flex flex-col gap-4 pt-[22px] lg:flex-row lg:items-start lg:gap-9">
        <div className="max-w-[95ch] min-w-0 flex-1 space-y-3 leading-[1.55] text-dim-foreground">
          <p>{editionRules(calendar)}</p>
          {challenge.description && <p className="whitespace-pre-line">{challenge.description}</p>}
        </div>
        {(tools || data.editions.length > 1) && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {tools}
            {edition && data.editions.length > 1 && (
              <EditionSwitcher challengeId={challenge.id} editions={data.editions} current={edition.id} />
            )}
          </div>
        )}
      </section>
      {edition ? (
        <div className="mt-8">
          <DecemberStrip tiles={calendarStrip(edition, data.today)} label={`Edition ${edition.year} calendar`} />
          <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <AdventDoors doors={doors} yourSeat={yourSeat} label={`Members of Edition ${edition.year}`} />
            <EditionPanel data={data} edition={edition} className="order-first lg:order-none" />
          </div>
        </div>
      ) : (
        <NoticeSlip title={data.read ? "No Edition yet" : "Not just now"} role="status" className="mt-8 max-w-xl">
          {data.read
            ? "The first Edition opens by itself. Check back soon."
            : "This Challenge's Editions couldn't be read. Try again in a moment."}
        </NoticeSlip>
      )}
    </div>
  );
}
