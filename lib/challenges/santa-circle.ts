import type { ChallengeMember, EditionAssignment } from "@/lib/challenges/types";

// The Santa circle (surface brief challenges-assignment, 4D as an accent):
// once an Edition ends, every member seated round a 260px ring in draw order
// (the viewer at the top), with an arrow inside from each Santa to the member
// they picked for. Pure geometry; the component draws it.

export const RING = 260;
const CENTRE = RING / 2;
const SEAT_RADIUS = 104;
const ARROW_RADIUS = 78;

export interface Seat {
  member: ChallengeMember;
  x: number;
  y: number;
  mine: boolean;
}

export interface Arrow {
  from: string;
  to: string;
  d: string;
  // Finished in holly, Expired (or anything else) in mute paper.
  tone: "finished" | "expired" | "other";
  dashed: boolean;
}

const round = (n: number) => Math.round(n * 10) / 10;

function point(radius: number, degrees: number): [number, number] {
  const rad = (degrees * Math.PI) / 180;
  return [round(CENTRE + radius * Math.cos(rad)), round(CENTRE + radius * Math.sin(rad))];
}

// The members in draw order: follow each Santa to the member they picked for,
// from the viewer when they took part. Anyone the chain misses (Santas not
// known) is seated after, in the order served.
function drawOrder(assignments: readonly EditionAssignment[], viewerId: string): ChallengeMember[] {
  const members = new Map<string, ChallengeMember>();
  const next = new Map<string, string>();
  for (const a of assignments) {
    members.set(a.recipient.user_id, a.recipient);
    if (a.santa) {
      if (!members.has(a.santa.user_id)) members.set(a.santa.user_id, a.santa);
      next.set(a.santa.user_id, a.recipient.user_id);
    }
  }
  const start = members.has(viewerId) ? viewerId : assignments[0]?.santa?.user_id;
  const order: string[] = [];
  for (let id = start; id && !order.includes(id) && members.has(id); id = next.get(id)) order.push(id);
  for (const id of members.keys()) if (!order.includes(id)) order.push(id);
  return order.map((id) => members.get(id) as ChallengeMember);
}

export function santaCircle(assignments: readonly EditionAssignment[], viewerId: string) {
  const order = drawOrder(assignments, viewerId);
  const step = 360 / Math.max(order.length, 1);
  const angle = new Map(order.map((m, i) => [m.user_id, -90 + i * step]));
  const seats: Seat[] = order.map((member) => {
    const [x, y] = point(SEAT_RADIUS, angle.get(member.user_id) as number);
    return { member, x, y, mine: member.user_id === viewerId };
  });
  const arrows: Arrow[] = [];
  for (const a of assignments) {
    if (!a.santa) continue;
    const from = angle.get(a.santa.user_id) as number;
    const sweep = ((angle.get(a.recipient.user_id) as number) - from + 360) % 360 || 360;
    const pad = sweep * 0.35;
    const [x1, y1] = point(ARROW_RADIUS, from + pad);
    const [x2, y2] = point(ARROW_RADIUS, from + sweep - pad);
    const status = a.run?.status;
    arrows.push({
      from: a.santa.user_id,
      to: a.recipient.user_id,
      d: `M${x1},${y1} A${ARROW_RADIUS},${ARROW_RADIUS} 0 ${sweep - 2 * pad > 180 ? 1 : 0} 1 ${x2},${y2}`,
      tone: status === "finished" ? "finished" : status === "expired" ? "expired" : "other",
      dashed: a.picked_randomly,
    });
  }
  arrows.sort((p, q) => (angle.get(p.from) as number) - (angle.get(q.from) as number));
  // Seats keep a few pixels apart round the ring.
  const seatSize = Math.min(26, Math.floor((2 * Math.PI * SEAT_RADIUS) / Math.max(order.length, 1)) - 4);
  return { seats, arrows, seatSize };
}

// The member who picked for the viewer, once Santas are served.
export function yourSanta(assignments: readonly EditionAssignment[], viewerId: string): ChallengeMember | null {
  return assignments.find((a) => a.recipient.user_id === viewerId)?.santa ?? null;
}
