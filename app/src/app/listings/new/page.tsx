import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/listings/new");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">情報登録フォームは再構築中です</h1>
      <p className="text-gray-600 mb-8">
        新しいジャンル体系への移行に伴い、登録フォームは Step 6
        で新しい仕様に刷新されます。もうしばらくお待ちください。
      </p>
      <Link
        href="/"
        className="inline-block px-4 py-2 rounded text-white"
        style={{ backgroundColor: "#B21000" }}
      >
        トップへ戻る
      </Link>
    </div>
  );
}
