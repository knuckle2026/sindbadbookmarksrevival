/**
 * オープンリダイレクト対策
 * リダイレクト先が自サイト内のパスかチェックし、外部URLは拒否する
 */
export function safeRedirectPath(next: string | null, fallback = "/"): string {
  if (!next) return fallback;

  // 自サイト内のパスのみ許可（/ で始まり、// で始まらない）
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return fallback;
}
