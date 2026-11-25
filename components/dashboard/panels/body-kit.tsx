import type { ReactNode } from "react";
import type { UserSummary } from "@/lib/api/types";
import { avatarSrc, memberAvatarPath } from "@/lib/members/avatar";
import { memberName } from "@/lib/achievements";
import { GameCover } from "@/components/issue/game-cover";
import { MemberMark } from "@/components/challenges/host-badge";
import { PanelList } from "./panel-list";
import { PanelEmpty, PanelError } from "./panel-states";

// What every list panel's body shares: the error, the empty note or the
// rows, and the small media its rows lead with.

export function listBody<T>({
  rows,
  title,
  wide,
  row,
  empty,
}: {
  // null: the read failed.
  rows: readonly T[] | null;
  title: string;
  wide: boolean;
  row: (item: T, i: number) => ReactNode;
  empty?: string;
}): ReactNode {
  if (rows === null) return <PanelError title={title} />;
  if (rows.length === 0) return <PanelEmpty note={empty} />;
  return <PanelList wide={wide}>{rows.map(row)}</PanelList>;
}

export const gameHref = (gameId: number) => `/games/${gameId}`;
export const memberHref = (userId: string) => `/members/${userId}`;

// A member as the panels draw them: their name and stored avatar (the API's
// per-member avatar; the initials stand in when it is missing).
export function memberOf(user: Pick<UserSummary, "user_id" | "global_name" | "username">) {
  return { name: memberName(user), avatar: avatarSrc(memberAvatarPath(user.user_id)) };
}

// A 40px cover, with the member who logged it as a small avatar on its
// corner (club lists).
export function RowCover({
  title,
  coverUrl,
  member,
  width = 40,
}: {
  title: string;
  coverUrl: string | null | undefined;
  member?: { name: string; avatar: string | null };
  width?: 36 | 40;
}) {
  return (
    <span className="relative inline-block pr-1 pb-1">
      <GameCover
        title={title}
        coverUrl={coverUrl}
        className={width === 36 ? "w-9" : "w-10"}
        fallbackClassName="p-0.5 text-[0.5rem]"
      />
      {member && (
        <span className="absolute right-0 bottom-0 flex rounded-full ring-2 ring-card">
          <MemberMark name={member.name} src={member.avatar} size={20} />
        </span>
      )}
    </span>
  );
}

// A row's member avatar alone (Birthdays, journals).
export function RowAvatar({ name, avatar, size = 32 }: { name: string; avatar: string | null; size?: number }) {
  return <MemberMark name={name} src={avatar} size={size} />;
}
