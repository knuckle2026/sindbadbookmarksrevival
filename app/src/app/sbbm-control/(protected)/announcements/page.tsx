// @ts-nocheck
import { getAdminClient } from "@/lib/supabase/admin";
import AnnouncementManager from "./AnnouncementManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const { supabase } = await getAdminClient();

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">お知らせ管理</h1>
      <AnnouncementManager initialItems={data ?? []} />
    </div>
  );
}
