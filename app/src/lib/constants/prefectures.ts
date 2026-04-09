export type PrefectureSlug =
  | "hokkaido" | "aomori" | "iwate" | "miyagi" | "akita" | "yamagata" | "fukushima"
  | "ibaraki" | "tochigi" | "gunma" | "saitama" | "chiba" | "tokyo" | "kanagawa"
  | "niigata" | "toyama" | "ishikawa" | "fukui" | "yamanashi" | "nagano" | "gifu" | "shizuoka" | "aichi"
  | "mie" | "shiga" | "kyoto" | "osaka" | "hyogo" | "nara" | "wakayama"
  | "tottori" | "shimane" | "okayama" | "hiroshima" | "yamaguchi"
  | "tokushima" | "kagawa" | "ehime" | "kochi"
  | "fukuoka" | "saga" | "nagasaki" | "kumamoto" | "oita" | "miyazaki" | "kagoshima" | "okinawa";

export interface Prefecture {
  slug: PrefectureSlug;
  name: string;
}

export interface PrefectureRegion {
  slug: string;
  name: string;
  prefectures: Prefecture[];
}

export const PREFECTURE_REGIONS: PrefectureRegion[] = [
  {
    slug: "hokkaido-tohoku",
    name: "北海道・東北",
    prefectures: [
      { slug: "hokkaido", name: "北海道" },
      { slug: "aomori", name: "青森県" },
      { slug: "iwate", name: "岩手県" },
      { slug: "miyagi", name: "宮城県" },
      { slug: "akita", name: "秋田県" },
      { slug: "yamagata", name: "山形県" },
      { slug: "fukushima", name: "福島県" },
    ],
  },
  {
    slug: "kanto",
    name: "関東",
    prefectures: [
      { slug: "ibaraki", name: "茨城県" },
      { slug: "tochigi", name: "栃木県" },
      { slug: "gunma", name: "群馬県" },
      { slug: "saitama", name: "埼玉県" },
      { slug: "chiba", name: "千葉県" },
      { slug: "tokyo", name: "東京都" },
      { slug: "kanagawa", name: "神奈川県" },
    ],
  },
  {
    slug: "chubu",
    name: "中部",
    prefectures: [
      { slug: "niigata", name: "新潟県" },
      { slug: "toyama", name: "富山県" },
      { slug: "ishikawa", name: "石川県" },
      { slug: "fukui", name: "福井県" },
      { slug: "yamanashi", name: "山梨県" },
      { slug: "nagano", name: "長野県" },
      { slug: "gifu", name: "岐阜県" },
      { slug: "shizuoka", name: "静岡県" },
      { slug: "aichi", name: "愛知県" },
    ],
  },
  {
    slug: "kansai",
    name: "関西",
    prefectures: [
      { slug: "mie", name: "三重県" },
      { slug: "shiga", name: "滋賀県" },
      { slug: "kyoto", name: "京都府" },
      { slug: "osaka", name: "大阪府" },
      { slug: "hyogo", name: "兵庫県" },
      { slug: "nara", name: "奈良県" },
      { slug: "wakayama", name: "和歌山県" },
    ],
  },
  {
    slug: "chugoku",
    name: "中国",
    prefectures: [
      { slug: "tottori", name: "鳥取県" },
      { slug: "shimane", name: "島根県" },
      { slug: "okayama", name: "岡山県" },
      { slug: "hiroshima", name: "広島県" },
      { slug: "yamaguchi", name: "山口県" },
    ],
  },
  {
    slug: "shikoku",
    name: "四国",
    prefectures: [
      { slug: "tokushima", name: "徳島県" },
      { slug: "kagawa", name: "香川県" },
      { slug: "ehime", name: "愛媛県" },
      { slug: "kochi", name: "高知県" },
    ],
  },
  {
    slug: "kyushu-okinawa",
    name: "九州・沖縄",
    prefectures: [
      { slug: "fukuoka", name: "福岡県" },
      { slug: "saga", name: "佐賀県" },
      { slug: "nagasaki", name: "長崎県" },
      { slug: "kumamoto", name: "熊本県" },
      { slug: "oita", name: "大分県" },
      { slug: "miyazaki", name: "宮崎県" },
      { slug: "kagoshima", name: "鹿児島県" },
      { slug: "okinawa", name: "沖縄県" },
    ],
  },
];

export const PREFECTURES: Prefecture[] = PREFECTURE_REGIONS.flatMap((r) => r.prefectures);

export const PREFECTURE_MAP: Record<string, string> = Object.fromEntries(
  PREFECTURES.map((p) => [p.slug, p.name])
);
