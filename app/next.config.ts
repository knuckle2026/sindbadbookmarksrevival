import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

// 全レスポンスに付与する基本セキュリティヘッダー。CSP は別途設計が必要なため
// ここでは入れない (script-src の許可ドメインが多岐にわたるため)。
const securityHeaders = [
  // iframe 埋め込み禁止 (クリックジャッキング対策)
  { key: "X-Frame-Options", value: "DENY" },
  // MIME sniffing 抑止
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 外部遷移時の Referer 制御
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // ブラウザ機能の不要な権限を全否定
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
