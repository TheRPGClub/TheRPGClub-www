"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";
import { avatarSrc, memberAvatarPath } from "@/lib/members/avatar";
import type { MentionNode } from "@/lib/codex/story-schema";
import { MemberMark } from "@/components/challenges/host-badge";

// A mentioned member while writing (5D): a chip with their avatar and the
// name they had when picked. Readers see their current name.
export function MentionChip(props: PlateElementProps) {
  const node = props.element as unknown as MentionNode;
  return (
    <PlateElement
      {...props}
      as="span"
      attributes={{ ...props.attributes, contentEditable: false, "data-mention": node.userId }}
      className="mx-px inline-flex translate-y-[-1px] items-center gap-1 rounded-[2px] bg-foreground/10 px-1 py-px align-baseline text-[0.92em] font-semibold text-foreground"
    >
      <MemberMark name={node.value || "?"} src={avatarSrc(memberAvatarPath(node.userId))} size={16} />
      {node.value || "member"}
      {props.children}
    </PlateElement>
  );
}
