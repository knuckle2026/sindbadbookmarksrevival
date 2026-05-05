/**
 * scrape-gclick.mjs が出力した gclick-raw.json を読み込み、
 * **実データ（店名・gclick 詳細URL）を保持したまま** D1 INSERT 文を生成する。
 *
 * - title は 1〜20 文字制約に合わせ、超過時のみ「…」付きで切り詰める
 * - description は 1〜100 文字制約に合わせ、超過時は切り詰め
 * - prefecture / ward は gclick の住所文字列から日本語マップで slug 変換
 *   (東京都の場合は city_jp から区を逆引き)
 * - listing_categories はジャンルに応じた標準カテゴリを 1〜2 件付与
 * - 冒頭で admin user の旧データを DELETE するので idempotent
 */

import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_PATH = path.join(__dirname, "data", "gclick-raw.json");
const OUT_PATH = path.join(__dirname, "data", "listings-seed.sql");

const ADMIN_USER_ID = "c1e1eb21-286e-446c-9dbc-4e40868f677f";

// ===== d1/seed/categories.sql の UUID =====

const GENRE_ID = {
  "bar-restaurant": "6f7f62e6-9188-4bea-b71a-b19dd5583d90",
  hattenba:         "8d9c701a-0adc-411c-b538-e849261d3bf5",
  "massage-urisen": "b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c",
  "video-gallery":  "8c03b22a-116c-412f-9c01-575f438f01c9",
  "fashion-beauty": "3e52a6ca-01b4-4027-959e-99b9000dec49",
  mania:            "041e8df9-ffb8-46fe-b4e1-42620224daf0",
};

const CATEGORY_ID = {
  "bar-restaurant": {
    "gay-bar":   "6588c6df-0081-4a2e-98b9-eb4f578947a7",
    club:        "41aec77e-9802-41ab-a9e1-4c8e1feff16d",
    "mixed-bar": "ef8db337-376d-4377-8cfa-4da6460cceed",
    dining:      "27ce14cd-4404-4807-a9d9-b41373abba9d",
  },
  hattenba: {
    "video-box": "aa375b3a-e9d9-4437-8fbc-04682c5b7a26",
    sauna:       "90d54ea5-600f-40ab-b2db-1adb03d85cbd",
    lodging:     "2daa87f7-453a-4e81-be74-e4a5ca37d127",
  },
  "massage-urisen": {
    massage: "40438ed8-4f91-405c-ba30-ccdabaf533e5",
    oil:     "32de353f-7649-4b5c-a6b0-d8288a25e08a",
    thai:    "42582ab0-46b6-4fd9-aae9-9531a77324fb",
    urisen:  "ea21af8f-78d1-4556-9bd0-fa709ee8aa13",
  },
};

const PREFECTURE_SLUG = {
  "東京都": "tokyo",     "大阪府": "osaka",     "京都府": "kyoto",
  "愛知県": "aichi",     "福岡県": "fukuoka",   "北海道": "hokkaido",
  "神奈川県": "kanagawa", "兵庫県": "hyogo",     "埼玉県": "saitama",
  "千葉県": "chiba",     "茨城県": "ibaraki",   "栃木県": "tochigi",
  "群馬県": "gunma",     "新潟県": "niigata",   "富山県": "toyama",
  "石川県": "ishikawa",  "福井県": "fukui",     "山梨県": "yamanashi",
  "長野県": "nagano",    "岐阜県": "gifu",      "静岡県": "shizuoka",
  "三重県": "mie",       "滋賀県": "shiga",     "奈良県": "nara",
  "和歌山県": "wakayama", "鳥取県": "tottori",   "島根県": "shimane",
  "岡山県": "okayama",   "広島県": "hiroshima", "山口県": "yamaguchi",
  "徳島県": "tokushima", "香川県": "kagawa",    "愛媛県": "ehime",
  "高知県": "kochi",     "佐賀県": "saga",      "長崎県": "nagasaki",
  "熊本県": "kumamoto",  "大分県": "oita",      "宮崎県": "miyazaki",
  "鹿児島県": "kagoshima","沖縄県": "okinawa",
  "青森県": "aomori",    "岩手県": "iwate",     "宮城県": "miyagi",
  "秋田県": "akita",     "山形県": "yamagata",  "福島県": "fukushima",
};

// gclick の city_jp が東京都の場合に区 slug へ寄せるパターン。
// 部分一致で評価する（先に来るものほど優先）。
const TOKYO_WARD_PATTERNS = [
  [/(新宿2丁目|新宿三丁目|新宿|西新宿|新大久保)/, "shinjuku"],
  [/(上野|浅草|秋葉原台東|台東|御徒町)/,        "taito"],
  [/(新橋|六本木|赤坂|麻布|青山|品川港)/,       "minato"],
  [/(渋谷|道玄坂|円山町|恵比寿)/,                "shibuya"],
  [/(池袋|大塚|巣鴨)/,                           "toshima"],
  [/(銀座|日本橋|月島)/,                         "chuo"],
  [/(秋葉原|神田|九段下)/,                       "chiyoda"],
  [/(北千住|綾瀬)/,                              "adachi"],
  [/(蒲田|大森)/,                                "ota"],
  [/(五反田|大崎|目黒品川)/,                     "shinagawa"],
  [/(中目黒|自由が丘)/,                          "meguro"],
  [/(錦糸町|押上|両国)/,                         "sumida"],
  [/(中野)/,                                     "nakano"],
  [/(高円寺|阿佐ヶ谷|荻窪|杉並)/,                "suginami"],
  [/(後楽園|本郷)/,                              "bunkyo"],
  [/(三軒茶屋|世田谷|下北沢)/,                   "setagaya"],
  [/(練馬|大泉)/,                                "nerima"],
  [/(板橋)/,                                     "itabashi"],
  [/(王子|赤羽北)/,                              "kita"],
  [/(日暮里|荒川)/,                              "arakawa"],
  [/(亀戸|門前仲町|江東)/,                       "koto"],
  [/(葛飾|金町)/,                                "katsushika"],
  [/(江戸川|小岩)/,                              "edogawa"],
];

// gclick_genre → 本プロジェクトの genre slug
const GCLICK_TO_GENRE = {
  gaybar:  "bar-restaurant",
  hatten:  "hattenba",
  urisen:  "massage-urisen",
  massage: "massage-urisen",
};

const GCLICK_TO_CATEGORY_CANDIDATES = {
  gaybar:  ["gay-bar"],
  hatten:  ["video-box", "sauna"],
  urisen:  ["urisen"],
  massage: ["massage"],
};

// ===== ユーティリティ =====

const sqlStr = (s) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const sqlNum = (n) => (n == null ? "NULL" : String(n));

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
function pickN(rng, arr, n) {
  const copy = arr.slice();
  const out = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

// 文字数 (グリフではなく code unit) で切る。日本語は概ね 1 文字 1 code unit (BMP)。
function clipChars(s, maxLen) {
  if (!s) return "";
  return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + "…";
}

function inferTokyoWard(cityJp) {
  if (!cityJp) return null;
  for (const [re, slug] of TOKYO_WARD_PATTERNS) {
    if (re.test(cityJp)) return slug;
  }
  return null;
}

// ===== メイン =====

async function main() {
  const raw = JSON.parse(await readFile(RAW_PATH, "utf8"));
  const rng = makeRng(20260505);

  const lines = [];
  lines.push("-- AUTO-GENERATED by app/scripts/build-seed-sql.mjs");
  lines.push("-- Source: scraped from https://www.gclick.jp/ (real names + detail URLs preserved)");
  lines.push("-- D1 auto-wraps multi-statement files; do not emit explicit BEGIN/COMMIT.");
  lines.push("");
  lines.push(`-- Idempotent: remove previous test data inserted by this admin user`);
  lines.push(`DELETE FROM listings WHERE user_id = '${ADMIN_USER_ID}';`);
  lines.push("");

  const listingInserts = [];
  const linkInserts = [];
  let titleClipped = 0;
  let descClipped = 0;
  let wardSet = 0;

  raw.forEach((r, i) => {
    const seq = i + 1;
    const genreSlug = GCLICK_TO_GENRE[r.gclick_genre];
    if (!genreSlug || !GENRE_ID[genreSlug]) {
      console.warn(`skip seq=${seq}: unknown gclick_genre ${r.gclick_genre}`);
      return;
    }
    const genreId = GENRE_ID[genreSlug];

    const id = randomUUID();

    const titleRaw = (r.name || "").trim();
    if (!titleRaw) return;
    const title = clipChars(titleRaw, 20);
    if (title !== titleRaw) titleClipped++;

    const descRaw = (r.description || "").trim() || `${r.prefecture_jp ?? ""} ${r.city_jp ?? ""}の店舗`.trim();
    const description = clipChars(descRaw, 100);
    if (description !== descRaw) descClipped++;

    // website_url: gclick の URL は使わない方針。
    //  1) 詳細ページから抽出した X / Instagram があればそれ
    //  2) なければ https://example.com/dummy/N のダミー
    const websiteUrl = r.social_url || `https://example.com/dummy/${seq}`;

    const prefSlug = PREFECTURE_SLUG[r.prefecture_jp] ?? null;
    let wardSlug = null;
    if (prefSlug === "tokyo") {
      wardSlug = inferTokyoWard(r.city_jp);
      if (wardSlug) wardSet++;
    }

    // service_areas / provider_ages は gclick リスト上にないので NULL のまま
    // (フォーム上は massage-urisen でだけ使うが実値が無いため空にする)
    const serviceAreas = null;
    const providerAges = null;

    const clickCount = Math.floor(rng() * 50);
    const daysAgo = Math.floor(rng() * 30);
    const ts = `datetime('now', '-${daysAgo} days')`;

    listingInserts.push(
      `INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, service_areas, provider_ages, status, click_count, created_by, updated_by, created_at, updated_at) VALUES (` +
      `${sqlStr(id)}, ${sqlStr(ADMIN_USER_ID)}, ${sqlStr(genreId)}, ${sqlStr(title)}, ${sqlStr(description)}, NULL, ${sqlStr(websiteUrl)}, ${sqlStr(prefSlug)}, ${sqlStr(wardSlug)}, ${sqlStr(serviceAreas)}, ${sqlStr(providerAges)}, 'published', ${sqlNum(clickCount)}, ${sqlStr(ADMIN_USER_ID)}, ${sqlStr(ADMIN_USER_ID)}, ${ts}, ${ts}` +
      `);`
    );

    const candidates = GCLICK_TO_CATEGORY_CANDIDATES[r.gclick_genre] ?? [];
    const catSlugs = pickN(rng, candidates, 1 + Math.floor(rng() * Math.min(2, candidates.length)));
    for (const catSlug of catSlugs) {
      const catId = CATEGORY_ID[genreSlug]?.[catSlug];
      if (!catId) continue;
      linkInserts.push(
        `INSERT OR IGNORE INTO listing_categories (listing_id, category_id) VALUES (${sqlStr(id)}, ${sqlStr(catId)});`
      );
    }
  });

  lines.push(`-- ${listingInserts.length} listings`);
  lines.push(...listingInserts);
  lines.push("");
  lines.push(`-- ${linkInserts.length} category links`);
  lines.push(...linkInserts);
  lines.push("");

  await writeFile(OUT_PATH, lines.join("\n"), "utf8");
  console.log(
    `Wrote ${listingInserts.length} listings + ${linkInserts.length} category links to ${OUT_PATH}\n` +
    `  titles clipped to 20 chars: ${titleClipped}\n` +
    `  descriptions clipped to 100 chars: ${descClipped}\n` +
    `  Tokyo ward inferred: ${wardSet}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
