import { fetchTodayFunFact } from "@/lib/api/codex";
import { dailyLabel } from "@/lib/codex/wall";
import { PANELS } from "@/lib/dashboard/panels";
import { FunFactText } from "@/components/codex/fun-fact-text";
import { PanelEmpty, PanelError } from "./panel-states";

// Codex fact: the Daily Fun Fact last posted, as a small index card from
// the Fun Facts wall (Fun Facts pink, ruled, ink type), dated by the day it
// went out.
export async function CodexBody() {
  const read = await fetchTodayFunFact();
  if (read === null || read === "not_found") return <PanelError title={PANELS.codex.title} />;
  const fact = read.funFact;
  if (!fact) return <PanelEmpty />;
  const [day, time] = read.clubDate ? dailyLabel(read.clubDate).split(" · ") : [null, null];

  return (
    <article className="my-2 mb-3 -rotate-[0.8deg] rounded-xs bg-codex-fact bg-[repeating-linear-gradient(transparent_0_27px,rgb(11_11_13/0.13)_27px_28px)] bg-position-[0_46px] px-4 pt-3.5 pb-3 text-background shadow-[0_8px_18px_rgb(0_0_0/0.4)] motion-safe:transition-transform motion-safe:hover:rotate-0">
      <header className="mb-2 flex items-baseline justify-between gap-3 border-b-2 border-background pb-1.5">
        <h4 className="font-headline text-2xl leading-[0.9]">{day ?? "Fun Fact"}</h4>
        {time && <span className="font-label text-[0.75rem] font-bold tracking-[0.06em]">Daily · {time}</span>}
      </header>
      <p className="mb-2 text-base leading-7 font-medium text-pretty [&_a]:decoration-background/55">
        <FunFactText body={fact.body ?? ""} mentions={fact.mentions} />
      </p>
      <footer className="font-label text-[0.75rem] font-bold tracking-[0.06em]">by {fact.author.name}</footer>
    </article>
  );
}
