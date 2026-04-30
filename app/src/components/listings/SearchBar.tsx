"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  /** If set, submit navigates to this path with ?q=...; otherwise stays on current path. */
  targetPath?: string;
  placeholder?: string;
}

export default function SearchBar({
  targetPath,
  placeholder = "名称・説明で検索",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();

    if (targetPath) {
      const url = trimmed
        ? `${targetPath}?q=${encodeURIComponent(trimmed)}`
        : targetPath;
      router.push(url);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.delete("page");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="border-b border-zinc-200 bg-white px-4 py-2">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-5xl items-center gap-2"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 active:opacity-70"
          style={{ backgroundColor: "#005766" }}
        >
          検索
        </button>
      </form>
    </div>
  );
}
