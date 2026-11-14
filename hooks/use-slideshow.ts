"use client";

import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import type { CarouselApi } from "@/components/ui/carousel";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// A crossfading slideshow that advances on its own (WCAG 2.2.2): hovering
// it or moving focus into it holds it, the pause control stops it until
// played again (playing again overrides a hold until the pointer or focus
// leaves), and under reduced motion it never advances by itself.

export const SLIDE_SECONDS = 7;

export function useSlideshow() {
  const reduced = useReducedMotion();
  const [plugins] = useState(() => [
    Fade(),
    Autoplay({
      delay: SLIDE_SECONDS * 1000,
      playOnInit: false,
      stopOnInteraction: false,
      stopOnFocusIn: false,
      stopOnMouseEnter: false,
    }),
  ]);
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [override, setOverride] = useState(false);
  // Bumped each time the autoplay timer starts, so the current tick refills.
  const [run, setRun] = useState(0);
  const [timing, setTiming] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    const onTimerSet = () => {
      setRun((n) => n + 1);
      setTiming(true);
    };
    const onTimerStopped = () => setTiming(false);
    onSelect();
    api.on("select", onSelect);
    api.on("autoplay:timerset", onTimerSet);
    api.on("autoplay:timerstopped", onTimerStopped);
    return () => {
      api.off("select", onSelect);
      api.off("autoplay:timerset", onTimerSet);
      api.off("autoplay:timerstopped", onTimerStopped);
    };
  }, [api]);

  const playing = !reduced && !paused && (override || (!hovered && !focused));

  useEffect(() => {
    const autoplay = api?.plugins().autoplay;
    if (!autoplay) return;
    if (playing) autoplay.play();
    else autoplay.stop();
  }, [api, playing]);

  const togglePaused = useCallback(() => {
    // Playing again is a deliberate choice: it beats the hover or focus hold
    // that the click itself brings.
    setOverride(paused);
    setPaused(!paused);
  }, [paused]);

  const goTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
      api?.plugins().autoplay?.reset();
    },
    [api],
  );

  const holdHandlers = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => {
      setHovered(false);
      setOverride(false);
    },
    onFocus: () => setFocused(true),
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      setFocused(false);
      setOverride(false);
    },
  };

  return {
    setApi,
    plugins,
    selected,
    reduced,
    paused,
    playing,
    timing,
    run,
    goTo,
    togglePaused,
    holdHandlers,
  };
}
