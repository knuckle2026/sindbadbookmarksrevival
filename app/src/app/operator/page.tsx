import Image from "next/image";
import { listAnnouncements } from "@/lib/db/queries/announcements";
import { listFaqs } from "@/lib/db/queries/faqs";
import FeedbackForm from "./FeedbackForm";

export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const [announcements, faqs] = await Promise.all([
    listAnnouncements(),
    listFaqs(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-8">
      <section>
        <h2 className="mb-4 text-xl font-bold text-zinc-900">
          運営事務局からのご案内
        </h2>
        {announcements.length > 0 ? (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-zinc-900">
                    {a.title}
                  </h3>
                  <time className="shrink-0 text-xs text-zinc-400">
                    {new Date(a.updated_at).toLocaleDateString("ja-JP")}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-700">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            現在お知らせはありません。
          </p>
        )}
      </section>

      <Image
        src="/images/gankersA.jpg"
        alt=""
        width={2048}
        height={2048}
        className="h-auto w-full rounded-lg"
      />

      <section>
        <h2 className="mb-4 text-xl font-bold text-zinc-900">FAQ</h2>
        {faqs.length > 0 ? (
          <ul className="space-y-3">
            {faqs.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <p className="mb-2 font-semibold text-zinc-900">
                  Q. {f.question}
                </p>
                <p className="whitespace-pre-wrap text-sm text-zinc-700">
                  A. {f.answer}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
            FAQはまだ登録されていません。
          </p>
        )}
      </section>

      <Image
        src="/images/gankersB.jpg"
        alt=""
        width={1024}
        height={1024}
        className="h-auto w-full rounded-lg"
      />

      <section>
        <h2 className="mb-4 text-xl font-bold text-zinc-900">ご意見ご要望</h2>
        <FeedbackForm />
      </section>
    </div>
  );
}
