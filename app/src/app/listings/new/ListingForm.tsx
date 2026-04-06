// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  group_type: "purpose" | "industry";
  name: string;
}

export default function ListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const purposeCategories = categories.filter((c) => c.group_type === "purpose");
  const industryCategories = categories.filter((c) => c.group_type === "industry");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"shop" | "organization" | "media">("shop");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [address, setAddress] = useState("");
  const [friendliness, setFriendliness] = useState<
    "" | "Dedicated" | "Friendly" | "Ally"
  >("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("名称は必須です");
      return;
    }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?next=/listings/new");
      return;
    }

    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        type,
        title: title.trim(),
        description: description.trim() || null,
        address: address.trim() || null,
        website_url: websiteUrl.trim() || null,
        friendliness: friendliness || null,
      })
      .select("id")
      .single();

    if (insertError || !listing) {
      setError(insertError?.message ?? "登録に失敗しました");
      setLoading(false);
      return;
    }

    if (selectedCategories.length > 0) {
      await supabase.from("listing_categories").insert(
        selectedCategories.map((categoryId) => ({
          listing_id: listing.id,
          category_id: categoryId,
        }))
      );
    }

    router.push(`/listings/${listing.id}`);
  };

  const inputClass =
    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 名称 */}
      <div>
        <label className={labelClass}>
          名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：新宿二丁目 ○○バー"
          className={inputClass}
          required
        />
      </div>

      {/* 種別 */}
      <div>
        <label className={labelClass}>
          種別 <span className="text-red-500">*</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className={inputClass}
        >
          <option value="shop">店舗</option>
          <option value="organization">団体・コミュニティ・NPO</option>
          <option value="media">メディア・Webサービス・アプリ</option>
        </select>
      </div>

      {/* 説明 */}
      <div>
        <label className={labelClass}>説明</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="どんな場所・サービスかを簡単に説明してください"
          rows={4}
          className={inputClass}
        />
      </div>

      {/* ウェブサイト */}
      <div>
        <label className={labelClass}>ウェブサイトURL</label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* 住所 */}
      <div>
        <label className={labelClass}>住所・所在地</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="例：東京都新宿区新宿2丁目（オンライン専用の場合は空欄）"
          className={inputClass}
        />
      </div>

      {/* フレンドリー度 */}
      <div>
        <label className={labelClass}>フレンドリー度</label>
        <select
          value={friendliness}
          onChange={(e) => setFriendliness(e.target.value as typeof friendliness)}
          className={inputClass}
        >
          <option value="">選択しない</option>
          <option value="Dedicated">専門（LGBTを主な対象としたサービス）</option>
          <option value="Friendly">フレンドリー（LGBT対応を明示的に掲げている）</option>
          <option value="Ally">アライ（理解・協力を表明している）</option>
        </select>
      </div>

      {/* 目的別カテゴリ */}
      <div>
        <label className={labelClass}>目的別カテゴリ（複数選択可）</label>
        <div className="flex flex-wrap gap-2">
          {purposeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategories.includes(cat.id)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 業態別カテゴリ */}
      <div>
        <label className={labelClass}>業態別カテゴリ（複数選択可）</label>
        <div className="flex flex-wrap gap-2">
          {industryCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategories.includes(cat.id)
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "登録中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
