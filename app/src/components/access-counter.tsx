"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function AccessCounter() {
  const [count, setCount] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/counter/visit", { method: "POST" });
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
  }, [pathname]);

  if (count === null) return null;
  let display: string;
  try {
    display = count.toLocaleString();
  } catch {
    display = String(count);
  }
  return (
    <span className="text-[10px] font-light text-white/50 tabular-nums">
      {display}
    </span>
  );
}
