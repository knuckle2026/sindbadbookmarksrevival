import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getAuthAdminConfig(): Promise<{
  url: string;
  serviceRoleKey: string;
} | null> {
  const { env } = await getCloudflareContext({ async: true });
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !url) return null;
  return { url, serviceRoleKey };
}

export async function deleteAuthUser(userId: string): Promise<{
  ok: boolean;
  status: number;
  detail?: string;
}> {
  const cfg = await getAuthAdminConfig();
  if (!cfg) return { ok: false, status: 500, detail: "server_misconfigured" };
  const res = await fetch(`${cfg.url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
    },
  });
  if (!res.ok && res.status !== 404) {
    return { ok: false, status: res.status, detail: await res.text() };
  }
  return { ok: true, status: res.status };
}

export interface AuthUserSummary {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

export async function listAuthUsers(opts: {
  perPage?: number;
  page?: number;
}): Promise<AuthUserSummary[]> {
  const cfg = await getAuthAdminConfig();
  if (!cfg) return [];
  const params = new URLSearchParams();
  params.set("per_page", String(opts.perPage ?? 200));
  params.set("page", String(opts.page ?? 1));
  const res = await fetch(`${cfg.url}/auth/v1/admin/users?${params}`, {
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
    },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    users?: Array<{
      id: string;
      email?: string | null;
      created_at?: string | null;
      last_sign_in_at?: string | null;
    }>;
  };
  return (json.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at ?? null,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));
}

export async function getUserEmailsByIds(
  userIds: string[]
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  const cfg = await getAuthAdminConfig();
  if (!cfg) return {};
  const headers = {
    apikey: cfg.serviceRoleKey,
    Authorization: `Bearer ${cfg.serviceRoleKey}`,
  };
  const results = await Promise.all(
    userIds.map(async (id) => {
      const res = await fetch(`${cfg.url}/auth/v1/admin/users/${id}`, {
        headers,
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { id?: string; email?: string };
      if (!json.id || !json.email) return null;
      return { id: json.id, email: json.email };
    })
  );
  const map: Record<string, string> = {};
  for (const r of results) {
    if (r) map[r.id] = r.email;
  }
  return map;
}
