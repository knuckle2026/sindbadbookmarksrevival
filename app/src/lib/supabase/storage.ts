import { getCloudflareContext } from "@opennextjs/cloudflare";

const BUCKET = "banners";

async function getCfg(): Promise<{ url: string; key: string } | null> {
  const { env } = await getCloudflareContext({ async: true });
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function publicBannerUrl(storageKey: string): string {
  // Caller should ensure NEXT_PUBLIC_SUPABASE_URL is available client-side
  // (it is, per wrangler.jsonc vars).
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET}/${storageKey}`;
}

export async function uploadBannerObject(opts: {
  storageKey: string;
  contentType: string;
  body: ArrayBuffer | Blob;
}): Promise<{ ok: boolean; publicUrl?: string; detail?: string }> {
  const cfg = await getCfg();
  if (!cfg) return { ok: false, detail: "server_misconfigured" };
  const res = await fetch(
    `${cfg.url}/storage/v1/object/${BUCKET}/${opts.storageKey}`,
    {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": opts.contentType,
        "x-upsert": "false",
      },
      body: opts.body as BodyInit,
    },
  );
  if (!res.ok) return { ok: false, detail: await res.text() };
  return {
    ok: true,
    publicUrl: `${cfg.url}/storage/v1/object/public/${BUCKET}/${opts.storageKey}`,
  };
}

export async function deleteBannerObject(
  storageKey: string,
): Promise<{ ok: boolean; detail?: string }> {
  const cfg = await getCfg();
  if (!cfg) return { ok: false, detail: "server_misconfigured" };
  const res = await fetch(
    `${cfg.url}/storage/v1/object/${BUCKET}/${storageKey}`,
    {
      method: "DELETE",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
    },
  );
  if (!res.ok && res.status !== 404) {
    return { ok: false, detail: await res.text() };
  }
  return { ok: true };
}

export function isSupabasePublicUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!base) return false;
  return url.startsWith(`${base}/storage/v1/object/public/${BUCKET}/`);
}
