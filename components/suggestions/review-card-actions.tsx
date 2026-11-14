import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOOT_ACTION, FOOT_ACTION_OUTLINED } from "./card-foot";

// A Pending card's footer in the review queue: Reject and Approve, each
// opening its form under the card.
export function ReviewCardActions({
  onReject,
  onApprove,
}: {
  onReject: () => void;
  onApprove: () => void;
}) {
  return (
    <>
      <Button type="button" variant="card-action-destructive" onClick={onReject} className={FOOT_ACTION}>
        <X aria-hidden />
        Reject
      </Button>
      <Button type="button" variant="outline" onClick={onApprove} className={FOOT_ACTION_OUTLINED}>
        <Check aria-hidden />
        Approve
      </Button>
    </>
  );
}
