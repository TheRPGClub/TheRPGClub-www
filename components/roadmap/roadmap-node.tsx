import type { ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { isShipped } from "@/lib/roadmap/tree";
import type { RoadmapItem } from "@/lib/roadmap/types";
import { AreaTags } from "./area-tags";
import { NodeFeedback } from "./node-feedback";

// One Roadmap Item on the Skill Tree: a square-iconed node branching off the
// trunk. A Shipped one wears the green ring and a filled tick; a planned one
// is outlined with "+". The connector to the trunk is drawn by the node
// itself (left of it on phones; toward the centre from md, by its column).
// Staff editing wraps the same node, so it takes extra props through `rest`
// (a drag handle's listeners, a data attribute) and an optional `after`
// (its Edit chip). Its linked Feedback opens under the blurb. `later`
// recedes a node in a tier after "Next up": its
// title drops to dim paper, keeping AA contrast (no opacity).
export function RoadmapNode({
  item,
  later = false,
  className,
  after,
  ...rest
}: {
  item: RoadmapItem;
  later?: boolean;
  className?: string;
  after?: ReactNode;
} & Omit<React.ComponentProps<"li">, "children">) {
  const shipped = isShipped(item);
  return (
    <li
      data-shipped={shipped || undefined}
      className={cn(
        "relative flex min-h-[3.25rem] items-center gap-3 rounded-[3px] bg-card px-3.5 py-2.5 shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]",
        // The connector: to the trunk on the left on phones; from md, odd
        // nodes sit left of the trunk and reach right, even ones reach left.
        "after:absolute after:top-1/2 after:right-full after:h-0.5 after:w-[22px] after:bg-border-strong",
        "md:after:w-[60px] md:odd:after:right-auto md:odd:after:left-full",
        shipped && "shadow-[inset_0_0_0_1.5px_var(--color-ok)] after:bg-ok",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-[34px] shrink-0 place-items-center rounded-xs [&_svg]:size-[18px]",
          shipped
            ? "bg-ok text-background [&_svg]:stroke-[3]"
            : "text-faint-foreground shadow-[inset_0_0_0_2px_var(--color-border-strong)]",
        )}
      >
        {shipped ? <Check /> : <Plus />}
      </span>
      <div className="min-w-0">
        <span className="sr-only">{shipped ? "Ready: " : "Planned: "}</span>
        <span className={cn("block leading-snug font-semibold", later ? "text-dim-foreground" : "text-foreground")}>
          {item.title}
        </span>
        <span className="block text-sm leading-snug text-faint-foreground">{item.blurb}</span>
        <NodeFeedback feedback={item.feedback ?? []} />
      </div>
      <AreaTags area={item.area} />
      {after}
    </li>
  );
}
