// User-Agent 文字列を見てアプリ内ブラウザ (in-app browser / webview) かどうかを判定する。
// アプリ内ブラウザは Cloudflare Turnstile の iframe を正常にレンダリングできないことが
// 多く、Turnstile を必須にすると submit がブロックされてしまうため、サーバー側で
// Turnstile 検証をスキップする目的で使う。
//
// UA は容易に偽装できるため、これは「アプリ内ブラウザでも投稿できるようにする」
// という UX 緩和であって、bot 対策として信頼してはいけない。
// 安全性は引き続き honeypot と admin 承認に依存する。

const IN_APP_PATTERNS: RegExp[] = [
  /Line\//i,           // LINE 内蔵ブラウザ
  /FBAN|FBAV|FB_IAB/,  // Facebook (FB アプリ / FB Lite / Messenger)
  /Instagram/,         // Instagram 内蔵ブラウザ
  /Twitter|TwitterAndroid/i, // X (旧 Twitter) 内蔵ブラウザ
];

export function isInAppBrowser(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return IN_APP_PATTERNS.some((p) => p.test(userAgent));
}
