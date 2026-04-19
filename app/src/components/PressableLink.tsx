"use client";

import { useState } from "react";
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
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={pending ? (pendingClassName ?? className) : className}
      style={pending ? (pendingStyle ?? style) : style}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  );
}
