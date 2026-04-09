// @ts-nocheck
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { CategoryGroup, FriendlinessLevel } from "@/lib/supabase/types";

type DashboardCounts = {
  total_published: number;
  shop_count: number;
  org_count: number;
  media_count: number;
};

type CategoryCount = {
  category_id: string;
  group_type: CategoryGroup;
  name: string;
  slug: string;
  sort_order: number;
  listing_count: number;
};

type FriendlinessCount = {
  friendliness: FriendlinessLevel;
  listing_count: number;
};

// Category icons (emoji-based for simplicity)
const PURPOSE_ICONS: Record<string, string> = {
  social: "🤝",
  support: "💬",
  nightlife: "🌙",
  culture: "🎨",
  information: "📰",
  lifestyle: "🏠",
  advocacy: "⚖️",
};

const INDUSTRY_ICONS: Record<string, string> = {
  "food-drink": "🍽️",
  accommodation: "🏨",
  "beauty-fashion": "💇",
  healthcare: "🏥",
  legal: "📋",
  "it-tech": "💻",
  entertainment: "🎭",
  education: "📚",
  other: "📦",
};

const FRIENDLINESS_LABELS: Record<string, { label: string; color: string }> = {
  Dedicated: {
    label: "専門 (Dedicated)",
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
  Friendly: {
    label: "フレンドリー (Friendly)",
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  Ally: {
    label: "アライ (Ally)",
    color: "bg-sky-100 text-sky-800 border-sky-200",
  },
};

const TYPE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  shop: {
    label: "ショップ",
    icon: "🏪",
    color: "bg-amber-50 border-amber-200 text-amber-800",
  },
  organization: {
    label: "団体・NPO",
    icon: "🏛️",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  media: {
    label: "メディア",
    icon: "📱",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch all dashboard data in parallel using RPC
  const [countsRes, categoriesRes, friendlinessRes] = await Promise.all([
    supabase.rpc("get_dashboard_counts").single(),
    supabase.rpc("get_dashboard_category_counts"),
    supabase.rpc("get_dashboard_friendliness_counts"),
  ]);

  const counts = countsRes.data as DashboardCounts | null;
  const categories = (categoriesRes.data as CategoryCount[] | null) ?? [];
  const friendliness = (friendlinessRes.data as FriendlinessCount[] | null) ?? [];

  const purposeCategories = categories.filter((c) => c.group_type === "purpose");
  const industryCategories = categories.filter((c) => c.group_type === "industry");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          <span className="text-primary">sindbad</span>bookmarks
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          LGBTコミュニティのためのポータルサイト
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          ショップ・団体・メディアの情報を見つけよう
        </p>
      </section>

      {/* Total Count */}
      <section className="mb-10">
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 p-8 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">掲載情報 総数</p>
          <p className="mt-1 text-5xl font-bold">
            {counts?.total_published ?? 0}
            <span className="ml-2 text-lg font-normal opacity-80">件</span>
          </p>
        </div>
      </section>

      {/* Type Cards */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          情報タイプ別
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["shop", "organization", "media"] as const).map((type) => {
            const info = TYPE_INFO[type];
            const countKey = type === "shop"
              ? "shop_count"
              : type === "organization"
              ? "org_count"
              : "media_count";
            return (
              <Link
                key={type}
                href={`/listings?type=${type}`}
                className={`rounded-xl border p-6 transition-shadow hover:shadow-md ${info.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{info.icon}</span>
                  <div>
                    <p className="text-sm font-medium opacity-70">{info.label}</p>
                    <p className="text-3xl font-bold">
                      {counts?.[countKey] ?? 0}
                      <span className="ml-1 text-sm font-normal">件</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Purpose Categories */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          目的別カテゴリ
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {purposeCategories.map((cat) => (
            <Link
              key={cat.category_id}
              href={`/listings?category=${cat.slug}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-2xl">
                {PURPOSE_ICONS[cat.slug] ?? "📂"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {cat.name}
                </p>
                <p className="text-lg font-bold text-primary">
                  {cat.listing_count}
                  <span className="ml-1 text-xs font-normal text-zinc-500">件</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Industry Categories */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          業態別カテゴリ
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {industryCategories.map((cat) => (
            <Link
              key={cat.category_id}
              href={`/listings?category=${cat.slug}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-primary hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-2xl">
                {INDUSTRY_ICONS[cat.slug] ?? "📂"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {cat.name}
                </p>
                <p className="text-lg font-bold text-primary">
                  {cat.listing_count}
                  <span className="ml-1 text-xs font-normal text-zinc-500">件</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Friendliness */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          フレンドリー度別
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["Dedicated", "Friendly", "Ally"] as const).map((level) => {
            const info = FRIENDLINESS_LABELS[level];
            const count =
              friendliness.find((f) => f.friendliness === level)?.listing_count ?? 0;
            return (
              <Link
                key={level}
                href={`/listings?friendliness=${level}`}
                className={`rounded-xl border p-6 transition-shadow hover:shadow-md ${info.color}`}
              >
                <p className="text-sm font-medium">{info.label}</p>
                <p className="mt-1 text-3xl font-bold">
                  {count}
                  <span className="ml-1 text-sm font-normal">件</span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            情報を登録しませんか？
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            自薦・他薦を問わず、LGBTに関連するショップ・団体・メディアの情報を登録できます。
          </p>
          <Link
            href="/listings/new"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-light transition-colors"
          >
            情報を登録する
          </Link>
        </div>
      </section>
    </div>
  );
}
