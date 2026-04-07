"use client";

import Link from "next/link";
import { useState } from "react";

type SubItem = { label: string; href: string };
type Genre = { key: string; label: string; items: SubItem[] };

// Based on the requirements document (section 4)
const GENRES: Genre[] = [
  {
    key: "type",
    label: "情報タイプ",
    items: [
      { label: "店舗", href: "/listings?type=shop" },
      { label: "団体・NPO", href: "/listings?type=organization" },
      { label: "メディア", href: "/listings?type=media" },
    ],
  },
  {
    key: "purpose",
    label: "目的別",
    items: [
      { label: "交流・出会い", href: "/listings?category=social" },
      { label: "支援・相談", href: "/listings?category=support" },
      { label: "ナイトライフ", href: "/listings?category=nightlife" },
      { label: "文化・アート", href: "/listings?category=culture" },
      { label: "情報・メディア", href: "/listings?category=information" },
      { label: "暮らし・サービス", href: "/listings?category=lifestyle" },
      { label: "権利・アドボカシー", href: "/listings?category=advocacy" },
    ],
  },
  {
    key: "industry",
    label: "業態別",
    items: [
      { label: "飲食", href: "/listings?category=food-drink" },
      { label: "宿泊", href: "/listings?category=accommodation" },
      { label: "美容・ファッション", href: "/listings?category=beauty-fashion" },
      { label: "医療・メンタルヘルス", href: "/listings?category=healthcare" },
      { label: "法律・士業", href: "/listings?category=legal" },
      { label: "IT・テクノロジー", href: "/listings?category=it-tech" },
      { label: "エンターテインメント", href: "/listings?category=entertainment" },
      { label: "教育・研究", href: "/listings?category=education" },
      { label: "その他", href: "/listings?category=other" },
    ],
  },
  {
    key: "friendliness",
    label: "フレンドリー度",
    items: [
      { label: "専門 (Dedicated)", href: "/listings?friendliness=Dedicated" },
      { label: "フレンドリー (Friendly)", href: "/listings?friendliness=Friendly" },
      { label: "アライ (Ally)", href: "/listings?friendliness=Ally" },
    ],
  },
];

export function Sidebar() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(["type"]));

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <aside
      className="w-40 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        <Link
          href="/listings"
          className="block border-b border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 hover:bg-white/10"
        >
          すべて見る
        </Link>

        {GENRES.map((genre) => {
          const isOpen = openKeys.has(genre.key);
          return (
            <div key={genre.key} className="border-b border-white/20">
              <button
                type="button"
                onClick={() => toggle(genre.key)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/10"
                aria-expanded={isOpen}
              >
                <span>{genre.label}</span>
                <span
                  className={`text-xs transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </button>
              {isOpen && (
                <ul className="bg-black/15 pb-1">
                  {genre.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-4 py-1.5 text-xs text-white/90 hover:bg-white/15 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
