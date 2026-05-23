"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import { TOKYO_WARD_FILTER_OPTIONS } from "@/lib/constants/tokyo-wards";
import { OSAKA_AREAS } from "@/lib/constants/osaka-areas";
import { SERVICE_AREA_GROUPS } from "@/lib/constants/service-areas";
import { PROVIDER_AGES } from "@/lib/constants/provider-ages";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

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

export interface InitialValues {
  id?: string;
  title?: string;
  description?: string;
  websiteUrl?: string;
  genreId?: string;
  selectedCategories?: string[];
  prefecture?: string;
  ward?: string;
  serviceAreas?: string[];
  providerAges?: string[];
  address?: string;
}

interface Props {
  genres: GenreOption[];
  categories: CategoryOption[];
  mode?: "new" | "edit";
  initialValues?: InitialValues;
  redirectTo?: string;
  defaultGenreId?: string;
  /** Cancel button target. Falls back to router.back() when not provided. */
  cancelHref?: string;
}

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 100;
const URL_RE = /^https?:\/\/.+/;

export default function ListingForm({ genres, categories, mode = "new", initialValues, redirectTo, defaultGenreId, cancelHref }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialValues?.websiteUrl ?? "");
  const [genreId, setGenreId] = useState(initialValues?.genreId ?? defaultGenreId ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialValues?.selectedCategories ?? []);
  const [prefecture, setPrefecture] = useState(initialValues?.prefecture ?? "");
  const [ward, setWard] = useState(initialValues?.ward ?? "");
  const [serviceAreas, setServiceAreas] = useState<string[]>(initialValues?.serviceAreas ?? []);
  const [providerAges, setProviderAges] = useState<string[]>(initialValues?.providerAges ?? []);
  const [address, setAddress] = useState(initialValues?.address ?? "");

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

  const toggleProviderAge = (slug: string) => {
    setProviderAges((prev) =>
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

    const showWard = prefecture === "tokyo" || prefecture === "osaka";
    const showServiceAreas = !!genreMeta?.hasServiceAreas;
    const showProviderAges = !!genreMeta?.hasProviderAges;

    const payload = {
      genre_id: genreId,
      title: title.trim(),
      description: description.trim(),
      website_url: websiteUrl.trim(),
      prefecture: prefecture || null,
      ward: showWard && ward ? ward : null,
      service_areas:
        showServiceAreas && serviceAreas.length > 0 ? serviceAreas : null,
      provider_ages:
        showProviderAges && providerAges.length > 0 ? providerAges : null,
      address: address.trim() || null,
      category_ids: selectedCategories,
    };

    const isEdit = mode === "edit" && !!initialValues?.id;
    const url = isEdit ? `/api/listings/${initialValues.id}` : "/api/listings";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      router.push("/login?next=/listings/new");
      return;
    }
    if (!res.ok) {
      // レスポンス本文を一度だけ読み出して各種エラー分岐に使う
      // (二重読み出しは "Response body already used" で落ちるので注意)
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        limit?: string;
        max?: number;
      };
      if (res.status === 403) {
        if (body.error === "email_not_confirmed") {
          setError("メールアドレス確認が完了していません。確認メールのリンクをクリックしてから再度お試しください。");
        } else if (body.error === "age_gate_required") {
          setError("年齢確認が必要です。トップページから年齢確認を行ってから再度お試しください。");
        } else {
          setError(body.error ?? "権限エラー");
        }
        setLoading(false);
        return;
      }
      if (res.status === 429) {
        const max = body.max ?? "?";
        if (body.limit === "daily") {
          setError(`24時間に登録できる件数 (${max}件) を超えました。少し時間をおいて再度お試しください。`);
        } else {
          setError(`30日間に登録できる件数 (${max}件) を超えました。`);
        }
        setLoading(false);
        return;
      }
      setError(body.error ?? (isEdit ? "更新に失敗しました" : "登録に失敗しました"));
      setLoading(false);
      return;
    }

    router.push(redirectTo ?? "/my-listings");
  };

  const handleDelete = async () => {
    if (!initialValues?.id) return;
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/listings/${initialValues.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "unknown" }));
      setError(body.error ?? "削除に失敗しました");
      setDeleting(false);
      setShowDeleteModal(false);
      return;
    }

    router.push(redirectTo ?? "/my-listings");
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelClass =
    "mb-1 block text-sm font-medium text-zinc-800";

  const showWard = prefecture === "tokyo" || prefecture === "osaka";
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

      {/* カテゴリ + サービス提供者の年代 (横並び) */}
      {selectedGenreSlug && visibleCategories.length > 0 && (
        <div className={`${!!genreMeta?.hasProviderAges ? "flex gap-6" : ""}`}>
          {/* カテゴリ */}
          <div className="flex-1">
            <label className={labelClass}>カテゴリ（複数選択可）</label>
            <div className="space-y-2">
              {visibleCategories.map((c) => {
                const active = selectedCategories.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleCategory(c.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-zinc-800">{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* サービス提供者の年代 (マッサージ・売り専のみ、カテゴリの右側) */}
          {!!genreMeta?.hasProviderAges && (
            <div className="flex-1">
              <label className={labelClass}>サービス提供者の年代（複数選択可）</label>
              <div className="space-y-2">
                {PROVIDER_AGES.map((age) => {
                  const active = providerAges.includes(age.slug);
                  return (
                    <label key={age.slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleProviderAge(age.slug)}
                        className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-zinc-800">{age.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 所在地セクション (hasPrefecture ジャンルのみ) */}
      {!!genreMeta?.hasPrefecture && (
        <>
          <p className="text-sm font-semibold text-zinc-800">所在地</p>

          {/* 都道府県 + 区 (横並び) */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className={labelClass}>都道府県</label>
              <select
                value={prefecture}
                onChange={(e) => {
                  setPrefecture(e.target.value);
                  setWard("");
                }}
                className={inputClass}
              >
                <option value="">未選択</option>
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

            {showWard && (
              <div className="w-1/2">
                <label className={labelClass}>
                  {prefecture === "osaka" ? "エリア" : "区"}（任意）
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className={inputClass}
                >
                  <option value="">未選択</option>
                  {(prefecture === "osaka"
                    ? OSAKA_AREAS
                    : TOKYO_WARD_FILTER_OPTIONS
                  ).map((w) => (
                    <option key={w.slug} value={w.slug}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 住所詳細 */}
          <div>
            <label className={labelClass}>住所詳細（任意）</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

      {/* 出張エリア (hasServiceAreas=true ジャンルのみ) */}
      {showServiceAreas && (
        <div>
          <label className={labelClass}>出張可能エリア（複数選択可）</label>
          <p className="mb-2 text-xs text-zinc-500">
            出張可能な場合はカテゴリで出張も選択してください。
          </p>
          <div className="space-y-4">
            {SERVICE_AREA_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-xs font-semibold text-zinc-500">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {group.areas.map((a) => {
                    const active = serviceAreas.includes(a.slug);
                    return (
                      <label key={a.slug} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleServiceArea(a.slug)}
                          className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-zinc-800">{a.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (cancelHref) {
              router.push(safeRedirectPath(cancelHref, "/"));
            } else {
              router.back();
            }
          }}
          className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#005766" }}
        >
          {loading ? (mode === "edit" ? "更新中..." : "登録中...") : (mode === "edit" ? "更新する" : "登録する")}
        </button>
      </div>

      {/* 削除ボタン (編集モードのみ) */}
      {mode === "edit" && initialValues?.id && (
        <div className="border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            この情報を削除する
          </button>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-zinc-900">
              削除の確認
            </h2>
            <p className="mb-6 text-sm text-zinc-600">
              この登録情報を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
