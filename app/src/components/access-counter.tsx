"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function keyFromPathname(pathname: string): string | null {
  if (pathname === "/") return "top";
  const m = pathname.match(/^\/genres\/([^/?]+)/);
  if (m) return `genres:${m[1]}`;
  return null;
}

export function AccessCounter() {
  const [count, setCount] = useState<number | null>(null);
  const pathname = usePathname();
  const key = keyFromPathname(pathname);

  useEffect(() => {
    setCount(null);
    if (!key) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/counter/visit?key=${encodeURIComponent(key)}`,
          { method: "POST" },
        );
        if (!r.ok) return;
        const text = await r.text();
        if (!text) return;
        const d = JSON.parse(text) as { count?: number };
        if (!cancelled && typeof d.count === "number") setCount(d.count);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key || count === null) return null;
  let display: string;
  try {
    display = count.toLocaleString();
  } catch {
    display = String(count);
  }
  return (
    <span className="text-[10px] font-light text-white/50 tabular-nums">
      PV {display}
    </span>
  );
}
