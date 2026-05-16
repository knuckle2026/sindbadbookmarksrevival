"use client";

import { useTransition } from "react";
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
}: PressableLinkProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
    startTransition(() => {
      router.push(href);
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
