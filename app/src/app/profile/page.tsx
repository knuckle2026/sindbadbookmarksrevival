import { requireUser } from "@/lib/auth/guards";
import PasswordChangeForm from "./PasswordChangeForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { authUser, profile } = await requireUser();

  return (
    <div className="mx-auto max-w-md space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">プロフィール</h1>
        <p className="mt-1 text-sm text-zinc-500">
          アカウント情報の確認とパスワード変更ができます。
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <p className="text-xs font-medium text-zinc-500">表示名</p>
          <p className="mt-1 text-sm text-zinc-900">{profile.display_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">メールアドレス</p>
          <p className="mt-1 text-sm text-zinc-900">{authUser.email ?? "-"}</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">
          パスワード変更
        </h2>
        <PasswordChangeForm />
      </section>
    </div>
  );
}
