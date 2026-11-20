"use client";

import { useState, type ReactNode } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import type { PanelKey, PanelViewer } from "@/lib/dashboard/panels";
import { hidePanel, movePanel, ordinal, panelName, showPanel, type PanelChange } from "@/lib/dashboard/panel-edit";
import { useDashboardEdit } from "@/hooks/use-dashboard-edit";
import { usePanelDrag } from "@/hooks/use-panel-drag";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/templates/page-header";
import { HiddenTray } from "./hidden-tray";
import { PanelGrid } from "./panel-grid";
import { SaveNotice } from "./save-notice";

// "Around the club" (spec api#421; unify pick B, edit mode www#145): the
// member's Dashboard Panels under the issue, and Edit dashboard on the
// heading's rule. In edit mode every panel stays where it is and gets its
// control strip; the panels the member can use but doesn't show wait in the
// Hidden tray below. Changes apply at once and save behind.
export function PanelBoard({
  saved,
  available,
  fresh: freshAtLoad,
  customised,
  viewer,
  bodies,
  editable,
}: {
  saved: readonly PanelKey[];
  // Every panel the member can use, in the club's order.
  available: readonly PanelKey[];
  // The panels the API marks new.
  fresh: readonly PanelKey[];
  customised: boolean;
  viewer: PanelViewer;
  bodies: Partial<Record<PanelKey, ReactNode>>;
  // The API's list was read (not the fallback default), so it can be edited.
  editable: boolean;
}) {
  const edit = useDashboardEdit(saved, customised);
  const { shown, editing, failure } = edit;
  const [said, setSaid] = useState("");
  const [opened, setOpened] = useState(false);
  // As the page first loaded: opening edit mode clears `new` in the API, and
  // a panel switched on renders the page again, but the stamps stay up for
  // the rest of this visit.
  const [fresh] = useState(freshAtLoad);

  // Apply a change, say it to a screen reader, and put focus where the
  // control went (the switch moves between a panel and the tray).
  function change(next: PanelKey[] | null, what: PanelChange, focusId: string) {
    if (!next) return;
    edit.apply(next, what);
    const name = panelName(what.key);
    const at = ordinal(next.indexOf(what.key) + 1);
    setSaid(what.kind === "hide" ? `${name} hidden.` : `${name} ${what.kind === "show" ? "shown" : "moved"}, ${at}.`);
    requestAnimationFrame(() => focusControl(focusId));
  }
  const drag = usePanelDrag(shown, (key, next) => change(next, { kind: "move", key }, `panel-switch-${key}`));
  const hidden = available.filter((key) => !shown.includes(key));
  const freshLeft = !opened && fresh.length > 0;

  return (
    <section aria-labelledby="around-the-club" className="space-y-5">
      <SectionHeading
        title={<span id="around-the-club">Around the club</span>}
        action={
          editable && (
          <Button
            variant={editing ? "highlight" : "heading-action"}
            size={editing ? "sm" : "default"}
            onClick={() => {
              if (editing) return edit.close();
              setOpened(true);
              edit.open();
            }}
          >
            {editing ? <Check aria-hidden /> : <SlidersHorizontal aria-hidden />}
            {editing ? "Done" : "Edit dashboard"}
            {freshLeft && !editing && (
              <span aria-hidden className="font-headline ml-1 -rotate-6 rounded-xs bg-panel-new px-1.5 pt-0.75 pb-0.5 text-[0.85rem] leading-none tracking-normal text-background">
                New
              </span>
            )}
            {freshLeft && !editing && <span className="sr-only">, new panels to add</span>}
          </Button>
          )
        }
      />
      {editing && (
        <p className="font-label -mt-2 text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">
          <span className="hidden pointer-fine:inline">Editing · drag a panel by its grip, or use the arrows</span>
          <span className="pointer-fine:hidden">Editing · use the arrows to move a panel</span>
        </p>
      )}
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
      {shown.length > 0 ? (
        <PanelGrid
          shown={shown}
          viewer={viewer}
          bodies={bodies}
          editing={editing}
          failed={failure?.change.key ?? null}
          drag={drag}
          onMove={(key, step) => change(movePanel(shown, key, step), { kind: "move", key }, `panel-${step < 0 ? "up" : "down"}-${key}`)}
          onHide={(key) => change(hidePanel(shown, key), { kind: "hide", key }, `tray-switch-${key}`)}
        />
      ) : (
        <p className="rounded-xs border border-dashed border-border-strong px-4 py-4 text-dim-foreground">
          {editing ? "No panels on your dashboard. Switch one on below." : "No panels on your dashboard."}{!editing && editable && " Edit dashboard to bring some back."}
        </p>
      )}
      {editing && (
        <HiddenTray
          hidden={hidden}
          fresh={fresh}
          viewer={viewer}
          customised={edit.customised}
          onShow={(key) => change(showPanel(shown, key), { kind: "show", key }, `panel-switch-${key}`)}
        />
      )}
      {failure && <SaveNotice change={failure.change} onRetry={edit.retry} onDismiss={edit.dismiss} />}
    </section>
  );
}

// A control by its id (the arrows), or the switch inside the element marked
// `data-focus` (a Base UI switch keeps its id on a hidden input).
function focusControl(id: string) {
  const el =
    document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-focus="${id}"] [role="switch"]`);
  el?.focus();
}
