// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GENRES } from "@/lib/constants/genres";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import { TOKYO_WARDS } from "@/lib/constants/tokyo-wards";
import { SERVICE_AREAS } from "@/lib/constants/service-areas";

export interface GenreOption {
  id: string;
  slug: string;
  name: string;
}

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  genreSlug: string;
}

interface Props {
  genres: GenreOption[];
  categories: CategoryOption[];
}

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 100;
const URL_RE = /^https?:\/\/.+/;

export default function ListingForm({ genres, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [genreId, setGenreId] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [prefecture, setPrefecture] = useState("");
  const [ward, setWard] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [address, setAddress] = useState("");

  const selectedGenreSlug = useMemo(
    () => genres.find((g) => g.id === genreId)?.slug ?? "",
    [genres, genreId],
  );

  const genreMeta = useMemo(
    () => GENRES.find((g) => g.slug === selectedGenreSlug),
    [selectedGenreSlug],
  );

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((c) => c.genreSlug === selectedGenreSlug)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, selectedGenreSlug],
  );

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleServiceArea = (slug: string) => {
    setServiceAreas((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
  };

  const validate = (): string | null => {
    if (!title.trim()) return "名称は必須です";
    if (title.trim().length > TITLE_MAX) return `名称は${TITLE_MAX}文字以内です`;
    if (!description.trim()) return "説明は必須です";
    if (description.trim().length > DESCRIPTION_MAX)
      return `説明は${DESCRIPTION_MAX}文字以内です`;
    if (!websiteUrl.trim()) return "ウェブサイトURLは必須です";
    if (!URL_RE.test(websiteUrl.trim()))
      return "ウェブサイトURLは http(s):// から始まる必要があります";
    if (!genreId) return "ジャンルを選択してください";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
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

    const showWard = prefecture === "tokyo";
    const showServiceAreas = !!genreMeta?.hasServiceAreas;

    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        genre_id: genreId,
        title: title.trim(),
        description: description.trim(),
        website_url: websiteUrl.trim(),
        prefecture: prefecture || null,
        ward: showWard && ward ? ward : null,
        service_areas:
          showServiceAreas && serviceAreas.length > 0 ? serviceAreas : null,
        address: address.trim() || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !listing) {
      setError(insertError?.message ?? "登録に失敗しました");
      setLoading(false);
      return;
    }

    if (selectedCategories.length > 0) {
      const { error: catError } = await supabase
        .from("listing_categories")
        .insert(
          selectedCategories.map((categoryId) => ({
            listing_id: listing.id,
            category_id: categoryId,
          })),
        );
      if (catError) {
        setError(`カテゴリ保存エラー: ${catError.message}`);
        setLoading(false);
        return;
      }
    }

    router.push(`/listings/${listing.id}`);
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const labelClass =
    "mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200";

  const showWard = prefecture === "tokyo";
  const showServiceAreas = !!genreMeta?.hasServiceAreas;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* 1. ジャンル */}
      <div>
        <label className={labelClass}>
          ジャンル <span className="text-red-500">*</span>
        </label>
        <select
          value={genreId}
          onChange={(e) => {
            setGenreId(e.target.value);
            setSelectedCategories([]);
            setServiceAreas([]);
          }}
          className={inputClass}
          required
        >
          <option value="">選択してください</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 名称 */}
      <div>
        <label className={labelClass}>
          名称 <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-zinc-500">
            ({title.length}/{TITLE_MAX})
          </span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          className={inputClass}
          required
        />
      </div>

      {/* 3. ウェブサイトURL */}
      <div>
        <label className={labelClass}>
          ウェブサイトURL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          className={inputClass}
          required
        />
      </div>

      {/* 4. 説明 */}
      <div>
        <label className={labelClass}>
          説明 <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-zinc-500">
            ({description.length}/{DESCRIPTION_MAX})
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={3}
          className={inputClass}
          required
        />
      </div>

      {/* カテゴリ (複数選択) */}
      {selectedGenreSlug && visibleCategories.length > 0 && (
        <div>
          <label className={labelClass}>カテゴリ（複数選択可）</label>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((c) => {
              const active = selectedCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-red-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 都道府県 */}
      <div>
        <label className={labelClass}>都道府県（任意）</label>
        <select
          value={prefecture}
          onChange={(e) => {
            setPrefecture(e.target.value);
            setWard("");
          }}
          className={inputClass}
        >
          <option value="">選択しない（オンライン等）</option>
          {PREFECTURE_REGIONS.map((region) => (
            <optgroup key={region.slug} label={region.name}>
              {region.prefectures.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* 区 (東京のみ) */}
      {showWard && (
        <div>
          <label className={labelClass}>区（任意）</label>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className={inputClass}
          >
            <option value="">選択しない</option>
            {TOKYO_WARDS.map((w) => (
              <option key={w.slug} value={w.slug}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 住所 (自由入力) */}
      <div>
        <label className={labelClass}>住所（任意）</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* 出張エリア (hasServiceAreas=true ジャンルのみ) */}
      {showServiceAreas && (
        <div>
          <label className={labelClass}>出張エリア（複数選択可）</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_AREAS.map((a) => {
              const active = serviceAreas.includes(a.slug);
              return (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => toggleServiceArea(a.slug)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-red-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#B21000" }}
        >
          {loading ? "登録中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
