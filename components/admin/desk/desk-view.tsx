"use client";

import { useState } from "react";
import type { TrayCard } from "@/lib/desk-tray";
import { deskTabHref, type DeskTab, type JobsShow } from "@/lib/desk-tabs";
import { MastheadTabs, type MastheadTab } from "@/components/templates/masthead-tabs";
import { DeskContext } from "@/components/admin/desk/desk-context";
import { DeskTray } from "@/components/admin/desk/desk-tray";

// The Staff desk under its header: the in-tray of what's waiting, then the
// masthead tabs, one per job group and Bot jobs. The open tab (and Bot jobs'
// filter) is kept in the URL by replacing it, without a navigation.
export function DeskView({
  cards,
  tabs,
  initialTab,
  initialShow,
}: {
  cards: TrayCard[];
  tabs: MastheadTab<DeskTab>[];
  initialTab: DeskTab;
  initialShow: JobsShow;
}) {
  const [tab, setTab] = useState(initialTab);
  const [show, setShowState] = useState(initialShow);
  const keys = tabs.map((t) => t.key);

  const go = (next: DeskTab, nextShow: JobsShow) => {
    setTab(next);
    setShowState(nextShow);
    window.history.replaceState(null, "", deskTabHref(next, keys, nextShow));
  };
  const desk = {
    show,
    setShow: (s: JobsShow) => go("jobs", s),
    openJobs: (s: JobsShow = "all") => {
      go("jobs", s);
      document.getElementById("desk-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  };

  return (
    <DeskContext.Provider value={desk}>
      <DeskTray cards={cards} />
      <div id="desk-tabs" className="mt-11 scroll-mt-20">
        <MastheadTabs label="Staff desk" value={tab} onValueChange={(next) => go(next, show)} tabs={tabs} />
      </div>
    </DeskContext.Provider>
  );
}
