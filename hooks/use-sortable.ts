"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  insertionIndex,
  jumpFrom,
  moveTo,
  stepFrom,
  zoneOf,
  zonesChanged,
  type SortId,
  type SortLayout,
  type SortRect,
  type SortZones,
} from "@/lib/sortable";

// The site's one way to reorder (Make Room, pick B, 2026-11-25). Grab an
// item itself: a lifted copy follows the pointer, the item's place stays as
// a hatched yellow gap, and the others slide aside live as it moves, also
// across zones (Mainline / Spin-offs / Add-ons). Mouse: drag past 5px (a
// plain click still clicks). Touch: press and hold 250ms. Keyboard: focus
// the item, Space lifts, arrows move, Space or Enter drops, Escape puts it
// back. The look is CSS on the data-sort-* attributes (app/globals.css).

export interface SortMove<Z extends string, Id extends SortId> {
  id: Id;
  from: Z;
  to: Z;
  index: number;
}

export interface SortableOptions<Z extends string, Id extends SortId> {
  // The saved order. The caller applies a drop (optimistically) in onDrop.
  zones: SortZones<Z, Id>;
  layout: SortLayout | Partial<Record<Z, SortLayout>>;
  onDrop: (next: SortZones<Z, Id>, move: SortMove<Z, Id>) => void;
  canDrop?: (id: Id, to: Z) => boolean;
  // A zone's order isn't the member's to set (a Franchise's release order,
  // a Pool): an item only changes zone, and the arrows jump between zones.
  fixedOrder?: boolean;
  disabled?: boolean;
  // Names for the screen reader's running commentary.
  name: (id: Id) => string;
  zoneName?: (zone: Z) => string;
}

// Controls inside an item keep their own clicks and keys.
const NO_DRAG = "button,input,textarea,select,label,[role=switch],[role=menuitem],[data-no-drag]";
const HOLD_MS = 250;
const SLOP_PX = 5;
const EDGE_PX = 56;

type Mode = "pointer" | "keyboard";

export function useSortable<Z extends string, Id extends SortId>(opts: SortableOptions<Z, Id>) {
  const { zones: saved, disabled = false } = opts;
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts;
  });

  const [preview, setPreview] = useState<SortZones<Z, Id> | null>(null);
  const [active, setActive] = useState<{ id: Id; mode: Mode } | null>(null);
  const [overZone, setOverZone] = useState<Z | null>(null);
  const [status, setStatus] = useState("");
  const describedBy = useId();

  const items = useRef(new Map<Id, HTMLElement>());
  const zoneEls = useRef(new Map<Z, HTMLElement>());
  const rects = useRef(new Map<Id, SortRect>());
  const first = useRef<Map<Id, DOMRect> | null>(null);
  // Only our own slides are cancelled: an item's entrance animation is its own.
  const slides = useRef(new Map<Id, Animation>());
  const previewRef = useRef<SortZones<Z, Id> | null>(null);
  const ghost = useRef<{ el: HTMLElement; dx: number; dy: number } | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const swallowClick = useRef(false);
  // A keyboard step moves the focused node, which blurs it for a moment.
  const stepping = useRef(false);
  const frame = useRef(0);

  const zones = preview ?? saved;
  const layoutOf = (z: Z): SortLayout => {
    const l = optsRef.current.layout;
    return typeof l === "string" ? l : (l[z] ?? "rows");
  };
  const say = (id: Id, z: SortZones<Z, Id>) => {
    const zone = zoneOf(z, id);
    if (zone === null) return;
    const { name, zoneName } = optsRef.current;
    const where = Object.keys(z).length > 1 && zoneName ? ` in ${zoneName(zone)}` : "";
    setStatus(`${name(id)}, ${z[zone].indexOf(id) + 1} of ${z[zone].length}${where}`);
  };

  // Every item's settled box (no slide in flight), for hit-testing.
  const measure = useCallback(() => {
    rects.current = new Map([...items.current].map(([id, el]) => [id, el.getBoundingClientRect()]));
  }, []);

  // A new live order: snapshot where things are now, so they can slide.
  const show = useCallback((next: SortZones<Z, Id> | null) => {
    first.current = new Map([...items.current].map(([id, el]) => [id, el.getBoundingClientRect()]));
    previewRef.current = next;
    setPreview(next);
  }, []);

  useLayoutEffect(() => {
    const before = first.current;
    first.current = null;
    slides.current.forEach((a) => a.cancel());
    slides.current.clear();
    measure();
    if (!before || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    items.current.forEach((el, id) => {
      const a = before.get(id);
      const b = rects.current.get(id);
      if (!a || !b) return;
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx || dy) slides.current.set(id, el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 200, easing: "cubic-bezier(.2,.8,.2,1)" }));
    });
  }, [preview, measure]);

  // Keyboard moves can drop focus as the item's node moves: put it back.
  useLayoutEffect(() => {
    if (active?.mode === "keyboard") items.current.get(active.id)?.focus({ preventScroll: true });
    stepping.current = false;
  }, [active, preview]);

  const finish = useCallback((commit: boolean) => {
    const cur = active;
    const next = previewRef.current;
    ghost.current?.el.remove();
    ghost.current = null;
    cancelAnimationFrame(frame.current);
    delete document.body.dataset.sorting;
    setActive(null);
    setOverZone(null);
    if (!cur || !next) return show(null);
    const o = optsRef.current;
    if (commit && zonesChanged(o.zones, next)) {
      const from = zoneOf(o.zones, cur.id)!;
      const to = zoneOf(next, cur.id)!;
      first.current = new Map([...items.current].map(([id, el]) => [id, el.getBoundingClientRect()]));
      previewRef.current = null;
      setPreview(null);
      o.onDrop(next, { id: cur.id, from, to, index: next[to].indexOf(cur.id) });
      setStatus(`Dropped. ${o.name(cur.id)} is ${next[to].indexOf(cur.id) + 1} of ${next[to].length}${Object.keys(next).length > 1 && o.zoneName ? ` in ${o.zoneName(to)}` : ""}.`);
    } else {
      show(null);
      setStatus(commit ? "Dropped where it was." : `Put back. ${o.name(cur.id)} is where it was.`);
    }
  }, [active, show]);

  // Pointer: the gap follows the pointer, zone by zone.
  const track = useCallback((x: number, y: number) => {
    const cur = active;
    const z = previewRef.current;
    if (!cur || !z) return;
    if (ghost.current) ghost.current.el.style.transform = `translate(${x - ghost.current.dx}px,${y - ghost.current.dy}px)`;
    const mine = new Set(zoneEls.current.values());
    const hit = document.elementsFromPoint(x, y).find((el) => mine.has(el as HTMLElement));
    const zone = hit ? ([...zoneEls.current].find(([, el]) => el === hit)?.[0] ?? null) : null;
    if (zone === null) return;
    const { canDrop } = optsRef.current;
    if (canDrop && !canDrop(cur.id, zone)) return setOverZone(null);
    setOverZone(zone);
    if (optsRef.current.fixedOrder && zone === zoneOf(z, cur.id)) return;
    const others = z[zone].filter((id) => id !== cur.id);
    const boxes = others.map((id) => rects.current.get(id)).filter((r): r is SortRect => !!r);
    const index = insertionIndex(boxes, x, y, layoutOf(zone));
    const next = moveTo(z, cur.id, zone, index);
    if (next !== z) show(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layoutOf reads the options ref
  }, [active, show]);

  useEffect(() => {
    if (active?.mode !== "pointer") return;
    const scroll = () => {
      const { y } = pointer.current;
      const step = y < EDGE_PX ? -12 : y > innerHeight - EDGE_PX ? 12 : 0;
      if (step) {
        scrollBy(0, step);
        measure();
        track(pointer.current.x, pointer.current.y);
      }
      frame.current = requestAnimationFrame(scroll);
    };
    frame.current = requestAnimationFrame(scroll);
    const move = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      track(e.clientX, e.clientY);
    };
    const up = () => {
      swallowClick.current = true;
      setTimeout(() => (swallowClick.current = false), 0);
      finish(true);
    };
    const cancel = () => finish(false);
    const key = (e: globalThis.KeyboardEvent) => e.key === "Escape" && finish(false);
    // Holding still then moving must not scroll the page under the drag.
    const touch = (e: TouchEvent) => e.preventDefault();
    const onScroll = () => measure();
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", cancel);
    addEventListener("keydown", key);
    addEventListener("scroll", onScroll, true);
    document.addEventListener("touchmove", touch, { passive: false });
    return () => {
      cancelAnimationFrame(frame.current);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", cancel);
      removeEventListener("keydown", key);
      removeEventListener("scroll", onScroll, true);
      document.removeEventListener("touchmove", touch);
    };
  }, [active, track, finish, measure]);

  const lift = (id: Id, mode: Mode, at?: { x: number; y: number }) => {
    const el = items.current.get(id);
    if (!el) return;
    measure();
    if (mode === "pointer" && at) {
      const box = el.getBoundingClientRect();
      const copy = el.cloneNode(true) as HTMLElement;
      copy.removeAttribute("id");
      copy.dataset.sortGhost = "";
      delete copy.dataset.sortState;
      // Inline, so no utility class on the item (relative, a margin) can
      // pull the copy out of place.
      Object.assign(copy.style, {
        position: "fixed",
        zIndex: "60",
        margin: "0",
        pointerEvents: "none",
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        transform: "none",
      });
      document.body.appendChild(copy);
      ghost.current = { el: copy, dx: at.x - box.left, dy: at.y - box.top };
      document.body.dataset.sorting = "";
      pointer.current = at;
    }
    previewRef.current = optsRef.current.zones;
    setPreview(optsRef.current.zones);
    setActive({ id, mode });
    const o = optsRef.current;
    setStatus(
      mode === "keyboard"
        ? `Picked up ${o.name(id)}. Arrow keys move it, Space drops it, Escape puts it back.`
        : `Picked up ${o.name(id)}.`,
    );
  };

  const item = (id: Id) => ({
    ref: (el: HTMLElement | null) => {
      if (el) items.current.set(id, el);
      else items.current.delete(id);
    },
    tabIndex: disabled ? undefined : 0,
    "data-sort-item": disabled ? undefined : "",
    "data-sort-state": active?.id === id ? (active.mode === "keyboard" ? "held" : "gap") : undefined,
    "aria-roledescription": disabled ? undefined : "sortable item",
    "aria-describedby": disabled ? undefined : describedBy,
    onDragStart: (e: { preventDefault(): void }) => {
      if (!disabled) e.preventDefault();
    },
    onClickCapture: (e: MouseEvent) => {
      if (!swallowClick.current) return;
      e.preventDefault();
      e.stopPropagation();
    },
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled || active || e.button !== 0) return;
      const target = e.target as HTMLElement;
      const control = target.closest(NO_DRAG);
      if (control && e.currentTarget.contains(control) && control !== e.currentTarget) return;
      const start = { x: e.clientX, y: e.clientY };
      const touch = e.pointerType === "touch";
      let timer: ReturnType<typeof setTimeout> | undefined;
      const stop = () => {
        clearTimeout(timer);
        removeEventListener("pointermove", move);
        removeEventListener("pointerup", stop);
        removeEventListener("pointercancel", stop);
        removeEventListener("contextmenu", block, true);
      };
      const go = (at: { x: number; y: number }) => {
        stop();
        lift(id, "pointer", at);
        navigator.vibrate?.(8);
      };
      const move = (ev: PointerEvent) => {
        const far = Math.hypot(ev.clientX - start.x, ev.clientY - start.y);
        if (touch) {
          if (far > 8) stop();
        } else if (far > SLOP_PX) go({ x: ev.clientX, y: ev.clientY });
      };
      // A long press would otherwise open the phone's image or link menu.
      const block = (ev: Event) => ev.preventDefault();
      if (touch) timer = setTimeout(() => go(start), HOLD_MS);
      addEventListener("pointermove", move);
      addEventListener("pointerup", stop);
      addEventListener("pointercancel", stop);
      addEventListener("contextmenu", block, true);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (disabled || e.target !== e.currentTarget) return;
      const held = active?.id === id && active.mode === "keyboard";
      if (!held) {
        if (e.key === " ") {
          e.preventDefault();
          lift(id, "keyboard");
        }
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      } else if (/^Arrow(Up|Down|Left|Right)$/.test(e.key)) {
        e.preventDefault();
        const z = previewRef.current ?? saved;
        const dir = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1;
        const { canDrop, fixedOrder } = optsRef.current;
        const step = (fixedOrder ? jumpFrom : stepFrom)(z, Object.keys(z) as Z[], id, dir, canDrop);
        if (!step) return;
        const next = moveTo(z, id, step.zone, step.index);
        stepping.current = true;
        show(next);
        say(id, next);
      }
    },
    onBlur: () => {
      if (stepping.current) return;
      if (active?.id === id && active.mode === "keyboard") finish(true);
    },
  });

  const zone = (z: Z) => ({
    ref: (el: HTMLElement | null) => {
      if (el) zoneEls.current.set(z, el);
      else zoneEls.current.delete(z);
    },
    "data-sort-zone": z,
    "data-sort-over": active && overZone === z && Object.keys(zones).length > 1 ? "" : undefined,
  });

  return {
    zones,
    activeId: active?.id ?? null,
    dragging: active !== null,
    item,
    zone,
    // For <SortStatus>: the instructions every item points at, and the
    // running commentary.
    status: { id: describedBy, text: status },
  };
}

// What `item(id)` spreads onto an item, for components that take it as a prop.
export type SortItemProps = ReturnType<ReturnType<typeof useSortable<string, SortId>>["item"]>;
