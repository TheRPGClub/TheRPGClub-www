import { formatDay, type IsoDay } from "@/lib/challenges/dates";
import type { RunAction } from "@/lib/challenges/run-action";
import { SignUpButton } from "@/components/challenges/sign-up-button";
import { StartRunButton } from "@/components/challenges/start-run-button";

// What a flyer or billboard offers the viewer (surface brief
// challenges-index): Start a Run, Sign up for an Edition, or an ink chip
// once they're signed up ("Signed up · draw on 1 Dec"). Nothing otherwise.
export function BoardAction({
  action,
  challengeId,
  today,
}: {
  action: RunAction | undefined;
  challengeId: number;
  today: IsoDay;
}) {
  if (action?.kind === "start") return <StartRunButton challengeId={challengeId} again={action.again} />;
  if (action?.kind === "signup") return <SignUpButton editionId={action.editionId} />;
  if (action?.kind === "signed-up") {
    return (
      <p className="font-label relative inline-flex items-center rounded-sm bg-background px-2.5 py-2.5 text-[0.84rem] leading-none font-extrabold tracking-[0.08em] text-foreground">
        Signed up · draw on {formatDay(action.drawOn, today)}
      </p>
    );
  }
  return null;
}
