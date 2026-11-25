"use client";

import type { CSSProperties } from "react";
import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import { PROVIDER_VAR } from "@/lib/achievements/provider-color";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The showcase's switches, all in place (no page load): the service chips,
// a set switch when a service has several (PS4 and PS5 lists), the Club / Me
// lens, and the filter and order. The current choice of each carries the
// theme's selection mark.

export function Choice<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as T)} className="gap-0">
      <TabsList variant="chip" aria-label={label}>
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value} className="h-7 flex-none px-2.5 text-[0.82rem]">
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function ProviderChoice({
  value,
  providers,
  counts,
  onChange,
}: {
  value: AchievementProvider;
  providers: AchievementProvider[];
  counts: Partial<Record<AchievementProvider, number>>;
  onChange: (next: AchievementProvider) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as AchievementProvider)} className="gap-0">
      <TabsList variant="provider-chip" aria-label="Service">
        {providers.map((provider) => (
          <TabsTrigger
            key={provider}
            value={provider}
            style={{ "--tab-ink": PROVIDER_VAR[provider] } as CSSProperties}
            className="flex-none gap-1.5"
          >
            {PROVIDER_LABEL[provider]}
            <span className="opacity-75">{counts[provider]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
