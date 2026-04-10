export interface ServiceArea {
  slug: string;
  name: string;
}

export interface ServiceAreaGroup {
  label: string;
  areas: ServiceArea[];
}

// 東京特別枠
const TOKYO_AREAS: ServiceArea[] = [
  { slug: "tokyo-23", name: "東京23区" },
  { slug: "tokyo-out23", name: "東京23区外" },
];

// 46道府県（東京以外）
const PREFECTURES_EXCEPT_TOKYO: ServiceArea[] = [
  { slug: "hokkaido", name: "北海道" },
  { slug: "aomori", name: "青森県" },
  { slug: "iwate", name: "岩手県" },
  { slug: "miyagi", name: "宮城県" },
  { slug: "akita", name: "秋田県" },
  { slug: "yamagata", name: "山形県" },
  { slug: "fukushima", name: "福島県" },
  { slug: "ibaraki", name: "茨城県" },
  { slug: "tochigi", name: "栃木県" },
  { slug: "gunma", name: "群馬県" },
  { slug: "saitama", name: "埼玉県" },
  { slug: "chiba", name: "千葉県" },
  { slug: "kanagawa", name: "神奈川県" },
  { slug: "niigata", name: "新潟県" },
  { slug: "toyama", name: "富山県" },
  { slug: "ishikawa", name: "石川県" },
  { slug: "fukui", name: "福井県" },
  { slug: "yamanashi", name: "山梨県" },
  { slug: "nagano", name: "長野県" },
  { slug: "gifu", name: "岐阜県" },
  { slug: "shizuoka", name: "静岡県" },
  { slug: "aichi", name: "愛知県" },
  { slug: "mie", name: "三重県" },
  { slug: "shiga", name: "滋賀県" },
  { slug: "kyoto", name: "京都府" },
  { slug: "osaka", name: "大阪府" },
  { slug: "hyogo", name: "兵庫県" },
  { slug: "nara", name: "奈良県" },
  { slug: "wakayama", name: "和歌山県" },
  { slug: "tottori", name: "鳥取県" },
  { slug: "shimane", name: "島根県" },
  { slug: "okayama", name: "岡山県" },
  { slug: "hiroshima", name: "広島県" },
  { slug: "yamaguchi", name: "山口県" },
  { slug: "tokushima", name: "徳島県" },
  { slug: "kagawa", name: "香川県" },
  { slug: "ehime", name: "愛媛県" },
  { slug: "kochi", name: "高知県" },
  { slug: "fukuoka", name: "福岡県" },
  { slug: "saga", name: "佐賀県" },
  { slug: "nagasaki", name: "長崎県" },
  { slug: "kumamoto", name: "熊本県" },
  { slug: "oita", name: "大分県" },
  { slug: "miyazaki", name: "宮崎県" },
  { slug: "kagoshima", name: "鹿児島県" },
  { slug: "okinawa", name: "沖縄県" },
];

// グループ化（フォーム表示用）
export const SERVICE_AREA_GROUPS: ServiceAreaGroup[] = [
  { label: "東京", areas: TOKYO_AREAS },
  {
    label: "北海道・東北",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["hokkaido", "aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"].includes(a.slug),
    ),
  },
  {
    label: "関東",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "kanagawa"].includes(a.slug),
    ),
  },
  {
    label: "中部",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano", "gifu", "shizuoka", "aichi"].includes(a.slug),
    ),
  },
  {
    label: "関西",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"].includes(a.slug),
    ),
  },
  {
    label: "中国",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi"].includes(a.slug),
    ),
  },
  {
    label: "四国",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["tokushima", "kagawa", "ehime", "kochi"].includes(a.slug),
    ),
  },
  {
    label: "九州・沖縄",
    areas: PREFECTURES_EXCEPT_TOKYO.filter((a) =>
      ["fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa"].includes(a.slug),
    ),
  },
];

// フラットリスト（全48項目: 東京23区 + 東京23区外 + 46道府県）
export const SERVICE_AREAS: ServiceArea[] = [
  ...TOKYO_AREAS,
  ...PREFECTURES_EXCEPT_TOKYO,
];

export const SERVICE_AREA_MAP: Record<string, string> = Object.fromEntries(
  SERVICE_AREAS.map((a) => [a.slug, a.name]),
);
