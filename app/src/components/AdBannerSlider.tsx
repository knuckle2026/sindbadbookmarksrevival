"use client";

import { useEffect, useRef, useState } from "react";

interface PublicBanner {
  id: string;
  image_url: string;
  link_url: string;
  alt: string;
}

interface Props {
  placement: string;
}

const SLIDE_MS = 5000;

export function AdBannerSlider({ placement }: Props) {
  const [banners, setBanners] = useState<PublicBanner[] | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/banners?placement=${encodeURIComponent(placement)}`,
        );
        if (!r.ok) return;
        const text = await r.text();
        if (!text) return;
        const data = JSON.parse(text) as { banners?: PublicBanner[] };
        if (!cancelled && Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  useEffect(() => {
    if (!banners || banners.length < 2 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [banners, paused]);

  // ロード中 (banners === null): バナー領域を予約してレイアウトシフトを防ぐ。
  //   placement にバナー設定がある可能性があるので、初期表示からヘッダー直下に
  //   aspect-[5/1] の灰色プレースホルダーを置き、画像ロード後も位置がブレないようにする。
  if (banners === null) {
    return (
      <div
        aria-hidden
        className="aspect-[5/1] w-full bg-zinc-100"
      />
    );
  }
  // ロード完了かつ空配列: バナー設定なし → 領域を消す
  if (banners.length === 0) return null;

  const safeIndex = index % banners.length;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[5/1] w-full overflow-hidden bg-zinc-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {banners.map((b) => (
          <a
            key={b.id}
            href={b.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block h-full w-full shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image_url}
              alt={b.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
