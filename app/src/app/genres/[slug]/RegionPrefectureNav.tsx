import Link from "next/link";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";

interface RegionPrefectureNavProps {
  slug: string;
  prefCountMap: Record<string, number>;
  selectedRegion: string | null;
  selectedPrefecture: string;
  categoryParam: string;
  serviceAreaParam: string;
}

function buildHref(
  slug: string,
  categoryParam: string,
  serviceAreaParam: string,
  region?: string,
  prefecture?: string,
): string {
  const params = new URLSearchParams();
  if (categoryParam) params.set("category", categoryParam);
  if (serviceAreaParam) params.set("service_area", serviceAreaParam);
  if (region) params.set("region", region);
  if (prefecture) params.set("prefecture", prefecture);
  const qs = params.toString();
  return `/genres/${slug}${qs ? `?${qs}` : ""}`;
}

export default function RegionPrefectureNav({
  slug,
  prefCountMap,
  selectedRegion,
  selectedPrefecture,
  categoryParam,
  serviceAreaParam,
}: RegionPrefectureNavProps) {
  const regionObj = selectedRegion
    ? PREFECTURE_REGIONS.find((r) => r.slug === selectedRegion)
    : null;

  const regionCounts = PREFECTURE_REGIONS.map((region) => ({
    ...region,
    count: region.prefectures.reduce(
      (sum, p) => sum + (prefCountMap[p.slug] ?? 0),
      0,
    ),
  }));

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold text-zinc-500">
        所在地絞り込み
      </p>

      <div className="flex flex-wrap gap-2">
        {regionCounts
          .filter((r) => r.slug !== selectedRegion)
          .map((r) => (
            <Link
              key={r.slug}
              href={buildHref(slug, categoryParam, serviceAreaParam, r.slug)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-red-400 hover:bg-red-50"
            >
              {r.name}{" "}
              <span className="text-zinc-400">
                ({r.count})
              </span>
            </Link>
          ))}
      </div>

      {regionObj && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-zinc-700">
            {regionObj.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {regionObj.prefectures.map((p) => {
              const isActive = selectedPrefecture === p.slug;
              return (
                <Link
                  key={p.slug}
                  href={buildHref(
                    slug,
                    categoryParam,
                    serviceAreaParam,
                    selectedRegion!,
                    p.slug,
                  )}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "border-red-500 bg-red-50 font-medium text-red-700"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-red-400 hover:bg-red-50"
                  }`}
                >
                  {p.name}{" "}
                  <span
                    className={
                      isActive
                        ? "text-red-500"
                        : "text-zinc-400"
                    }
                  >
                    ({prefCountMap[p.slug] ?? 0})
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
