export interface OsakaArea {
  slug: string;
  name: string;
}

export const OSAKA_AREAS: OsakaArea[] = [
  { slug: "osaka-kita",    name: "大阪キタ" },
  { slug: "osaka-minami",  name: "大阪ミナミ" },
  { slug: "tennoji-abeno", name: "天王寺・あべの" },
  { slug: "bay-area",      name: "ベイエリア" },
  { slug: "kyobashi",      name: "京橋" },
];

export const OSAKA_OUTSIDE_SLUG = "outside";
export const OSAKA_OUTSIDE_NAME = "その他";

export const OSAKA_AREA_FILTER_OPTIONS: OsakaArea[] = [
  ...OSAKA_AREAS,
  { slug: OSAKA_OUTSIDE_SLUG, name: OSAKA_OUTSIDE_NAME },
];

export const OSAKA_AREA_MAP: Record<string, string> = Object.fromEntries(
  OSAKA_AREA_FILTER_OPTIONS.map((a) => [a.slug, a.name]),
);
