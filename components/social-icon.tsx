"use client";

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
  const Icon = getSocialIcon(label);
  return (
    <Icon width={width} height={height} className={className} aria-hidden />
  );
}
