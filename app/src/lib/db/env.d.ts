import type {} from "@opennextjs/cloudflare";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SUPABASE_JWT_SECRET?: string;
  }
}

export {};
