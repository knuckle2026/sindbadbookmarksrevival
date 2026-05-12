"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function AccessCounter() {
  const [count, setCount] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/counter/visit", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { count?: number } | null) => {
        if (!cancelled && d && typeof d.count === "number") {
          setCount(d.count);
        }
      })
      .catch(() => {
        /* silent */
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (count === null) return null;
  return (
    <span className="text-[10px] font-light text-white/50 tabular-nums">
      {count.toLocaleString()}
    </span>
  );
}
