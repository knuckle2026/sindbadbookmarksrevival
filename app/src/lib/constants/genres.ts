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
  { slug: "bar-restaurant",     name: "バー・クラブ・飲食店",      sortOrder: 1, hasPrefecture: true },
  { slug: "hattenba",           name: "ハッテンバ",                sortOrder: 2, hasPrefecture: true },
  { slug: "massage-urisen",     name: "マッサージ・売り専",        sortOrder: 3, hasServiceAreas: true, hasProviderAges: true, hasPrefecture: true },
  { slug: "video-gallery",      name: "動画・ギャラリー",  sortOrder: 4 },
  { slug: "media-sns",          name: "メディア・SNS",             sortOrder: 5 },
  { slug: "org-consult",        name: "団体・相談先",              sortOrder: 6 },
  { slug: "matching",           name: "出会い",                    sortOrder: 7 },
  { slug: "fashion-beauty",     name: "ファッション・美容",        sortOrder: 8, hasPrefecture: true },
  { slug: "mania",              name: "マニア系",                  sortOrder: 9 },
  { slug: "other",              name: "その他",                    sortOrder: 10 },
];

export const GENRE_MAP: Record<string, GenreMeta> = Object.fromEntries(
  GENRES.map((g) => [g.slug, g])
);
