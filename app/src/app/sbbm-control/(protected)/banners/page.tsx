import { listBannersForAdmin } from "@/lib/db/queries/banners";
import { GENRES } from "@/lib/constants/genres";
import BannerManager from "./BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const items = await listBannersForAdmin();
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">バナー管理</h1>
      <BannerManager
        initialItems={items}
        genres={GENRES.map((g) => ({ slug: g.slug, name: g.name }))}
      />
    </div>
  );
}
