"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      fetch("/api/client-error", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: String(error?.message ?? ""),
          digest: error?.digest ?? null,
          stack: String(error?.stack ?? "").slice(0, 4000),
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
          href: typeof location !== "undefined" ? location.href : "",
        }),
      }).catch(() => {});
    } catch {}
  }, [error]);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const href = typeof location !== "undefined" ? location.href : "";
  const stack = String(error?.stack ?? "").slice(0, 2000);

  return (
    <html>
      <body
        style={{
          padding: 16,
          fontFamily: "sans-serif",
          color: "#111",
          background: "#fff",
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          エラーが発生しました
        </h1>
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          以下の内容をコピーして運営事務局までお送りください。
        </p>
        <pre
          style={{
            marginTop: 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            background: "#f4f4f5",
            padding: 12,
            borderRadius: 8,
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
{`message: ${error?.message ?? "(none)"}
digest:  ${error?.digest ?? "(none)"}
href:    ${href}
ua:      ${ua}

${stack}`}
        </pre>
        <button
          onClick={reset}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            background: "#005766",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          再試行
        </button>
      </body>
    </html>
  );
}
