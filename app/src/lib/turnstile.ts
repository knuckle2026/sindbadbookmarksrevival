// Cloudflare Turnstile server-side verification.
// Site/secret keys は Cloudflare ダッシュボードで発行する。
// 設定方法は README または PR 説明を参照。

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token against Cloudflare.
 *
 * - `TURNSTILE_SECRET_KEY` 未設定なら **検証スキップ** (true を返す)。
 *   Turnstile を opt-in 運用にしておくため、secret が無いプロダクションでも
 *   匿名投稿が完全に止まらないようにする。
 *   有効化したいときは `wrangler secret put TURNSTILE_SECRET_KEY` する。
 * - secret 設定済みの場合は実際に siteverify を呼び、結果に従う。
 */
export async function verifyTurnstile(
  token: string,
  ip?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Turnstile 未設定 → スキップ (honeypot だけが残る)
    return true;
  }
  if (!token) return false;

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body: form });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Server-side flag: Turnstile が運用上有効化されているか */
export function isTurnstileEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}
