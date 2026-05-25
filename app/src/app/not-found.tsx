import { redirect } from "next/navigation";

// 存在しないルートや `notFound()` 呼び出し時に、404 ページを表示せず
// トップページにそっと飛ばす UX 緩和。
// SEO 的にはちゃんと 404 を返した方が良いが、運用上ユーザーが
// 期限切れ / 非公開 listing の URL を踏んだときに迷わないことを優先。
export default function NotFound() {
  redirect("/");
}
