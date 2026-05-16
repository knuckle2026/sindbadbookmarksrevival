"use client";

import { useEffect } from "react";

const CHUNK_RELOAD_KEY = "__chunk_reload_at";
const CHUNK_RELOAD_COOLDOWN_MS = 10_000;

function isChunkLoadError(message: string): boolean {
  return (
    /Loading chunk \d+ failed/i.test(message) ||
    /ChunkLoadError/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const msg = String(error?.message ?? "");
  const chunkError = isChunkLoadError(msg);

  useEffect(() => {
    // Report to server log for diagnostics
    try {
      fetch("/api/client-error", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: msg,
          digest: error?.digest ?? null,
          stack: String(error?.stack ?? "").slice(0, 4000),
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
          href: typeof location !== "undefined" ? location.href : "",
          chunkError,
        }),
      }).catch(() => {});
    } catch {}

    // Auto-reload on chunk load errors (deploy-mid-session recovery)
    if (chunkError && typeof window !== "undefined") {
      try {
        const last = Number(
          window.sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0,
        );
        const now = Date.now();
        if (!Number.isFinite(last) || now - last > CHUNK_RELOAD_COOLDOWN_MS) {
          window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
          window.location.reload();
        }
      } catch {
        // sessionStorage 不可な環境では reload せずエラー画面のまま表示
      }
    }
  }, [error, msg, chunkError]);

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
          {chunkError ? "更新中です…" : "エラーが発生しました"}
        </h1>
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          {chunkError
            ? "サイトが更新されたため自動でリロードします。数秒お待ちください。"
            : "以下の内容をコピーして運営事務局までお送りください。"}
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
