import { listAnnouncements } from "@/lib/db/queries/announcements";
import AnnouncementManager from "./AnnouncementManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const items = await listAnnouncements();
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">お知らせ管理</h1>
      <AnnouncementManager initialItems={items} />
    </div>
  );
}
