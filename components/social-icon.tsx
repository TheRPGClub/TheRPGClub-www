"use client";

import { createElement } from "react";
import { getSocialIcon } from "@/lib/socials-icons";

interface SocialIconProps {
  label?: string | null;
  width?: string;
  height?: string;
  className?: string;
}

export function SocialIcon({
  label,
  width = "20",
  height = "20",
  className,
}: SocialIconProps) {
  // The icon is one of a fixed set of module-level components, picked by
  // label; createElement keeps that lookup out of JSX so it isn't mistaken
  // for a component defined during render.
  return createElement(getSocialIcon(label), {
    width,
    height,
    className,
    "aria-hidden": true,
  });
}
