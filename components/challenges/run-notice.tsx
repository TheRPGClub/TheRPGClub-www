"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { Button } from "@/components/ui/button";

// Where a refused Run action says so (surface briefs challenges-pool and
// challenges-profile-runs): the actions report into this, and the slot shows
// the notice slip in one place (at the switch rule on a Challenge page, above
// the past stamps on a profile), wherever the button that failed sits.

export interface RunNotice {
  title: string;
  message: string;
}

const RunNoticeContext = createContext<{
  notice: RunNotice | null;
  setNotice: (notice: RunNotice | null) => void;
}>({ notice: null, setNotice: () => {} });

export function RunNoticeProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<RunNotice | null>(null);
  const value = useMemo(() => ({ notice, setNotice }), [notice]);
  return <RunNoticeContext.Provider value={value}>{children}</RunNoticeContext.Provider>;
}

export function useRunNotice() {
  return useContext(RunNoticeContext).setNotice;
}

export function RunNoticeSlot({ className }: { className?: string }) {
  const { notice, setNotice } = useContext(RunNoticeContext);
  if (!notice) return null;
  return (
    <NoticeSlip
      title={notice.title}
      role="alert"
      className={className}
      action={
        <Button type="button" variant="inverse" size="sm" onClick={() => setNotice(null)}>
          Got it
        </Button>
      }
    >
      {notice.message}
    </NoticeSlip>
  );
}
