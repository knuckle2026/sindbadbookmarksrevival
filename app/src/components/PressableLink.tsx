"use client";

import { useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface PressableLinkProps {
  href: string;
  className?: string;
  pendingClassName?: string;
  style?: React.CSSProperties;
  pendingStyle?: React.CSSProperties;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: React.AriaAttributes["aria-current"];
  /**
   * Whether to scroll to top on navigation. Defaults to true (Next.js default).
   * Pass false to preserve scroll position (e.g. pagination within a list).
   */
  scroll?: boolean;
}

export function PressableLink({
  href,
  className,
  pendingClassName,
  style,
  pendingStyle,
  children,
  "aria-label": ariaLabel,
  "aria-current": ariaCurrent,
  scroll = true,
}: PressableLinkProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  // 直前のクリックで遷移を要求した hash (#xxx) を覚えておき、
  // ナビ完了 (isPending: true→false) でその要素にスクロールする。
  // Next.js の router.push は hash 付き URL のスクロールが安定しないため明示。
  const pendingHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    const hash = pendingHashRef.current;
    if (!hash) return;
    pendingHashRef.current = null;
    // RSC が DOM を差し替えた直後に対象要素が現れるよう次フレームで実行
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isPending]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isPending) return;
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      try {
        navigator.vibrate(10);
      } catch {
        /* silent */
      }
    }
    const hashIdx = href.indexOf("#");
    pendingHashRef.current = hashIdx >= 0 ? href.slice(hashIdx + 1) : null;
    startTransition(() => {
      router.push(href, { scroll });
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={isPending ? (pendingClassName ?? className) : className}
      style={isPending ? (pendingStyle ?? style) : style}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  );
}
