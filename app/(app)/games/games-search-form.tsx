"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 500;

export function GamesSearchForm({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(q: string) {
    const ps = new URLSearchParams();
    if (q.trim()) ps.set("q", q.trim());
    router.push(`/games${ps.size ? `?${ps}` : ""}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value), DEBOUNCE_MS);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(query);
  }

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="search"
        name="q"
        placeholder="Search games…"
        value={query}
        onChange={handleChange}
        className="w-56"
      />
      <Button type="submit" variant="outline">
        Search
      </Button>
    </form>
  );
}
