"use client";

import { unwrapLink, upsertLink } from "@platejs/link";
import {
  useListToolbarButton,
  useListToolbarButtonState,
} from "@platejs/list-classic/react";
import { KEYS } from "platejs";
// platejs/react re-exports @platejs/utils/react, where the toolbar hooks live.
import {
  useEditorRef,
  useEditorSelector,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from "platejs/react";
import { Link2, Link2Off } from "lucide-react";

import { ToolbarButton } from "./toolbar-button";

// The kinds of formatting button: a mark, a block type, a list, a link.
export function MarkButton({
  nodeType,
  label,
  children,
}: {
  nodeType: string;
  label: string;
  children: React.ReactNode;
}) {
  const state = useMarkToolbarButtonState({ nodeType });
  const { props } = useMarkToolbarButton(state);
  return (
    <ToolbarButton label={label} {...props}>
      {children}
    </ToolbarButton>
  );
}

export function BlockButton({
  nodeType,
  label,
  children,
}: {
  nodeType: string;
  label: string;
  children: React.ReactNode;
}) {
  const editor = useEditorRef();
  const pressed = useEditorSelector(
    (ed) => ed.api.block()?.[0]?.type === nodeType,
    [nodeType],
  );

  return (
    <ToolbarButton
      label={label}
      pressed={pressed}
      onClick={() => {
        // Every block plugin exposes `toggle`, keyed by its own type.
        const tf = editor.tf as unknown as Record<
          string,
          { toggle?: () => void } | undefined
        >;
        tf[nodeType]?.toggle?.();
      }}
    >
      {children}
    </ToolbarButton>
  );
}

export function ListButton({
  nodeType,
  label,
  children,
}: {
  nodeType: string;
  label: string;
  children: React.ReactNode;
}) {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);
  return (
    <ToolbarButton label={label} {...props}>
      {children}
    </ToolbarButton>
  );
}

export function LinkButtons() {
  const editor = useEditorRef();
  const inLink = useEditorSelector(
    (ed) => ed.api.some({ match: { type: ed.getType(KEYS.link) } }),
    [],
  );

  return (
    <>
      <ToolbarButton
        label={inLink ? "Change link" : "Add link"}
        pressed={inLink}
        onClick={() => {
          // A prompt keeps this to one dependency-free button. Plate's
          // floating link input is a whole UI surface, and a review (or an
          // entry) needs the occasional citation, not link management.
          const url = window.prompt("Link URL");
          if (!url) return;
          upsertLink(editor, { url });
        }}
      >
        <Link2 className="size-4" strokeWidth={1.75} />
      </ToolbarButton>

      {inLink && (
        <ToolbarButton
          label="Remove link"
          onClick={() => unwrapLink(editor, { split: true })}
        >
          <Link2Off className="size-4" strokeWidth={1.75} />
        </ToolbarButton>
      )}
    </>
  );
}
