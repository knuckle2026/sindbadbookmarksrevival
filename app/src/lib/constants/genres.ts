export interface GenreMeta {
  slug: string;
  name: string;
  sortOrder: number;
  /** Whether the service-areas field should be shown in the listing form */
  hasServiceAreas?: boolean;
  /** Whether the provider_ages field should be shown */
  hasProviderAges?: boolean;
  /** Whether prefecture/location fields should be shown */
  hasPrefecture?: boolean;
}

export const GENRES: GenreMeta[] = [
  { slug: "bar-restaurant",     name: "バー・飲食店",              sortOrder: 1, hasPrefecture: true },
  { slug: "hattenba",           name: "ハッテンバ",                sortOrder: 2, hasPrefecture: true },
  { slug: "massage-urisen",     name: "マッサージ・売り専",        sortOrder: 3, hasServiceAreas: true, hasProviderAges: true, hasPrefecture: true },
  { slug: "video-gallery",      name: "公式動画配信・ギャラリー",  sortOrder: 4 },
  { slug: "personal-site",      name: "個人サイト",                sortOrder: 5 },
  { slug: "org-consult",        name: "団体・相談先",              sortOrder: 6 },
  { slug: "matching",           name: "出会い",                    sortOrder: 7 },
  { slug: "crossdress-newhalf", name: "女装・ニューハーフ",        sortOrder: 8 },
  { slug: "fashion-beauty",     name: "ファッション・美容",        sortOrder: 9, hasPrefecture: true },
  { slug: "mania",              name: "マニア系",                 sortOrder: 10 },
  { slug: "other",              name: "その他",                   sortOrder: 11 },
];

export const GENRE_MAP: Record<string, GenreMeta> = Object.fromEntries(
  GENRES.map((g) => [g.slug, g])
);
