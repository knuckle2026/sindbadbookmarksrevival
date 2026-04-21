// @ts-nocheck
import { getAdminClient } from "@/lib/supabase/admin";
import FaqManager from "./FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const { supabase } = await getAdminClient();

  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">FAQ管理</h1>
      <FaqManager initialItems={data ?? []} />
    </div>
  );
}
