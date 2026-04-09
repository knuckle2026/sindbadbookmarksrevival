export interface ServiceArea {
  slug: string;
  name: string;
}

// Displayed only when the selected genre is "massage-urisen"
export const SERVICE_AREAS: ServiceArea[] = [
  { slug: "kanto", name: "関東" },
  { slug: "tokyo-23", name: "東京23区" },
  { slug: "tokyo-out23", name: "東京23区外" },
  { slug: "kansai", name: "関西" },
  { slug: "tokai", name: "東海" },
  { slug: "hokkaido", name: "北海道" },
  { slug: "tohoku", name: "東北" },
  { slug: "chubu", name: "中部" },
  { slug: "chugoku", name: "中国" },
  { slug: "shikoku", name: "四国" },
  { slug: "kyushu", name: "九州" },
  { slug: "okinawa", name: "沖縄" },
  { slug: "nationwide", name: "全国対応" },
];

export const SERVICE_AREA_MAP: Record<string, string> = Object.fromEntries(
  SERVICE_AREAS.map((a) => [a.slug, a.name])
);
