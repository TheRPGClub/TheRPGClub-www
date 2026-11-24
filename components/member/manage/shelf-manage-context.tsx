"use client";

import { createContext, useContext } from "react";
import { useShelfManage, type ShelfManage } from "@/hooks/use-shelf-manage";
import type {
  MemberShelfEntry,
  MemberShelfKind,
} from "@/lib/api/member-shelf-entry";
import type { ShelfOwner } from "@/lib/members/shelf-manage";

interface ShelfManageValue {
  owner: ShelfOwner;
  kind: MemberShelfKind;
  // The list's name in prose ("Backlog", "Completed").
  listName: string;
  // The page's entries, so adding a game already on it opens its entry.
  entries: readonly MemberShelfEntry[];
  manage: ShelfManage;
}

const ShelfManageContext = createContext<ShelfManageValue | null>(null);

// The owner's manage mode on a list page (spec api#451, pick 3A), shared by
// the add button in the page's header and the list below it. With no
// owner (anyone else viewing) it adds nothing.
export function ShelfManageProvider({
  owner,
  kind,
  listName,
  entries,
  children,
}: Omit<ShelfManageValue, "manage" | "owner"> & {
  owner: ShelfOwner | null;
  children: React.ReactNode;
}) {
  const manage = useShelfManage(owner?.userId ?? "", kind);
  if (!owner) return children;
  return (
    <ShelfManageContext.Provider
      value={{ owner, kind, listName, entries, manage }}
    >
      {children}
    </ShelfManageContext.Provider>
  );
}

export function useShelfManageContext(): ShelfManageValue {
  const value = useContext(ShelfManageContext);
  if (!value)
    throw new Error("A list's manage tools need its ShelfManageProvider.");
  return value;
}
