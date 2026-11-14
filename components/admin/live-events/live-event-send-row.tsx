import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

// Under the form: send it to the bot, or once sent, start another.
export function LiveEventSendRow({
  sent,
  pending,
  onStartAnother,
}: {
  sent: boolean;
  pending: boolean;
  onStartAnother: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2.5">
      {sent ? (
        <>
          <Button type="button" variant="outline" onClick={onStartAnother}>
            <Plus data-icon="inline-start" />
            Start another
          </Button>
          <span className="text-[0.86rem] text-faint-foreground">
            {"This one's with the bot. You can edit it in Discord once it's there."}
          </span>
        </>
      ) : (
        <>
          <Button type="submit" variant="highlight" disabled={pending}>
            <Send data-icon="inline-start" />
            {pending ? "Sending..." : "Send to the bot"}
          </Button>
          <span className="text-[0.86rem] text-faint-foreground">The bot makes the thread, then the event.</span>
        </>
      )}
    </div>
  );
}
