import { listFaqs } from "@/lib/db/queries/faqs";
import FaqManager from "./FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const items = await listFaqs();
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">FAQ管理</h1>
      <FaqManager initialItems={items} />
    </div>
  );
}
