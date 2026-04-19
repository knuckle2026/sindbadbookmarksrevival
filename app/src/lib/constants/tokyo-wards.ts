export interface TokyoWard {
  slug: string;
  name: string;
}

export const TOKYO_WARDS: TokyoWard[] = [
  { slug: "chiyoda", name: "千代田区" },
  { slug: "chuo", name: "中央区" },
  { slug: "minato", name: "港区" },
  { slug: "shinjuku", name: "新宿区" },
  { slug: "bunkyo", name: "文京区" },
  { slug: "taito", name: "台東区" },
  { slug: "sumida", name: "墨田区" },
  { slug: "koto", name: "江東区" },
  { slug: "shinagawa", name: "品川区" },
  { slug: "meguro", name: "目黒区" },
  { slug: "ota", name: "大田区" },
  { slug: "setagaya", name: "世田谷区" },
  { slug: "shibuya", name: "渋谷区" },
  { slug: "nakano", name: "中野区" },
  { slug: "suginami", name: "杉並区" },
  { slug: "toshima", name: "豊島区" },
  { slug: "kita", name: "北区" },
  { slug: "arakawa", name: "荒川区" },
  { slug: "itabashi", name: "板橋区" },
  { slug: "nerima", name: "練馬区" },
  { slug: "adachi", name: "足立区" },
  { slug: "katsushika", name: "葛飾区" },
  { slug: "edogawa", name: "江戸川区" },
];

export const TOKYO_OUTSIDE_SLUG = "outside";
export const TOKYO_OUTSIDE_NAME = "23区外";

export const TOKYO_WARD_FILTER_OPTIONS: TokyoWard[] = [
  ...TOKYO_WARDS,
  { slug: TOKYO_OUTSIDE_SLUG, name: TOKYO_OUTSIDE_NAME },
];

export const TOKYO_WARD_MAP: Record<string, string> = Object.fromEntries(
  TOKYO_WARD_FILTER_OPTIONS.map((w) => [w.slug, w.name])
);
