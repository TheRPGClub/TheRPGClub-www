import { SectionTitle } from "@/components/landing/section-title";

// How a round runs, in three numbered steps. The pitch's "How the club
// works" links here (#how).

const STEPS = [
  {
    title: "Nominate",
    body: "Members put forward the RPG and the non-RPG they want the club to play next, with a line on why.",
  },
  {
    title: "Vote",
    body: "The nominations become the ballot. Everyone gets a few votes per track, and the tally decides the winners.",
  },
  {
    title: "Play together",
    body: "The winners are the month's Game of the Month and Non-RPG Game of the Month, each with a Discord thread to talk about them.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="scroll-mt-6 border-t border-border px-4 py-12 sm:px-10 sm:py-18"
    >
      <SectionTitle id="how-title">How a round comes together</SectionTitle>
      <ol className="mt-8 grid gap-9 md:grid-cols-3 md:gap-7">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span
              aria-hidden
              className="font-headline block text-[5.25rem] leading-[0.8] text-muted [-webkit-text-stroke:1.5px_var(--color-faint-foreground)] sm:text-[7.5rem]"
            >
              {i + 1}
            </span>
            <h3 className="font-headline mt-3.5 text-[2.25rem] leading-[0.95]">
              {step.title}
            </h3>
            <p className="mt-2.5 max-w-[38ch] text-dim-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
