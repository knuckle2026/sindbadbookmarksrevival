/**
 * scrape-gclick.mjs / scrape-gpress.mjs が出力した JSON を読み込み、
 * **実データ（店名・URL）を保持したまま** D1 INSERT 文を生成する。
 *
 * - title は 1〜20 文字制約に合わせ、超過時のみ「…」付きで切り詰める
 * - description は 1〜100 文字制約に合わせ、超過時は切り詰め
 * - gclick: 住所文字列から prefecture / ward slug を逆引き
 * - gpress: prefecture/ward は NULL（オンライン中心のディレクトリ）
 * - listing_categories は各ソースのカテゴリ判定で付与
 * - 冒頭で admin user の旧データを DELETE するので idempotent
 */

import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GCLICK_RAW_PATH = path.join(__dirname, "data", "gclick-raw.json");
const GPRESS_RAW_PATH = path.join(__dirname, "data", "gpress-raw.json");
const OUT_PATH = path.join(__dirname, "data", "listings-seed.sql");

const ADMIN_USER_ID = "c1e1eb21-286e-446c-9dbc-4e40868f677f";

// ===== d1/seed/categories.sql の UUID =====

const GENRE_ID = {
  "bar-restaurant": "6f7f62e6-9188-4bea-b71a-b19dd5583d90",
  hattenba:         "8d9c701a-0adc-411c-b538-e849261d3bf5",
  "massage-urisen": "b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c",
  "video-gallery":  "8c03b22a-116c-412f-9c01-575f438f01c9",
  "media-sns":      "68254602-0411-4bdf-9544-608bf0b259ec",
  "org-consult":    "76c7d478-26d3-48f2-b5e2-5c1740e64020",
  matching:         "9238c7d0-4574-4edd-9736-c475ca792b19",
  "fashion-beauty": "3e52a6ca-01b4-4027-959e-99b9000dec49",
  mania:            "041e8df9-ffb8-46fe-b4e1-42620224daf0",
  other:            "6315411b-dcad-4c76-844e-709ba9490cca",
};

const CATEGORY_ID = {
  "bar-restaurant": {
    "gay-bar":   "6588c6df-0081-4a2e-98b9-eb4f578947a7",
    club:        "41aec77e-9802-41ab-a9e1-4c8e1feff16d",
    "mixed-bar": "ef8db337-376d-4377-8cfa-4da6460cceed",
    dining:      "27ce14cd-4404-4807-a9d9-b41373abba9d",
    "lesbian-bar": "87ea1bc3-87b7-4c82-9b10-02ab77d356b7",
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
  "video-gallery": {
    japan:            "d1ef6bc4-49e1-41e4-8379-b0c3e6207f22",
    world:            "4e031c89-463f-4953-9592-434100a8d3bd",
    asia:             "2d809353-2c1a-4be7-a0b1-e8a5101b7ca7",
    "subscription-ppv": "88793640-a820-48fb-8c83-8998105d0f25",
    shop:             "46d100c6-4092-4ef6-a53e-e0a11f3fd9a7",
    contents:         "b9517e19-2e27-40fb-ad93-799a9304a066",
  },
  "media-sns": {
    influencer: "1b478a3f-e020-4e83-8ef6-e18f2ab7d232",
    youtube:    "1fb0fac6-0053-44d6-a830-536f71a8ed97",
    tiktok:     "3e38e0f9-2291-49fa-9a1b-eaccad28bebb",
    liver:      "2c384d72-496c-460a-b7d2-0357089cdb87",
    blog:       "ddd04809-dd7c-490d-9da2-81737263fe21",
    publishing: "276f7b49-3f51-4101-821b-63507898bf4a",
  },
  "org-consult": {
    npo:           "cebccc04-94c8-461a-9c52-14b1c9a18580",
    volunteer:     "8a354d35-d35a-4d0a-8020-2902a5110565",
    circle:        "613af953-cc80-45b3-996f-0c5056f9f425",
    "medical-org": "fd92caa5-e861-4c02-849e-e653545f6b4c",
  },
  matching: {
    app:         "f523c408-a42b-42fc-9b8e-9e9e400fa19c",
    matchmaking: "72539a4e-4bff-4bb4-8a5a-e8e19498aa1d",
    board:       "d09dd5f2-219e-4c17-b7f0-3e62c0b75e13",
  },
  other: {
    "useful-site": "ab3e4611-cb92-467c-bfd6-07970455693e",
    abroad:        "fe6d6084-5c1b-4b31-981a-ac4bf0c603ac",
  },
  "fashion-beauty": {
    shop:      "bdbe8cf4-2753-44dd-90a3-ac629f420c21",
    shirt:     "02b37132-282f-4133-b7ea-8e9ac790ba6b",
    underwear: "b99f4943-6d48-4b3c-a030-6680dd03b74e",
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

// gclick の city_jp が大阪府の場合にエリア slug へ寄せるパターン (先に来るほど優先)。
const OSAKA_AREA_PATTERNS = [
  [/(大阪キタ|梅田|北新地|天満|天神橋|中崎町|福島|中之島)/, "osaka-kita"],
  [/(大阪ミナミ|心斎橋|道頓堀|難波|アメリカ村|堀江|日本橋)/, "osaka-minami"],
  [/(天王寺|あべの|阿倍野|大阪新世界|新世界|通天閣)/,         "tennoji-abeno"],
  [/(大阪港|ベイエリア|弁天町|USJ)/,                          "bay-area"],
  [/(京橋|OBP|大阪城|桜ノ宮)/,                                 "kyobashi"],
];

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

// gpress_category → 本プロジェクトの { genre, category }
const GPRESS_TO_GENRE = {
  gay:          { genre: "media-sns",     category: "blog" },
  look:         { genre: "media-sns",     category: "blog" },
  live:         { genre: "matching",      category: "board" },
  hiv:          { genre: "org-consult",   category: "medical-org" },
  match:        { genre: "matching",      category: "matchmaking" },
  club:         { genre: "org-consult",   category: "circle" },
  lesbian:      { genre: "media-sns",     category: "blog" },
  novel:        { genre: "media-sns",     category: "publishing" },
  consultation: { genre: "org-consult",   category: "volunteer" },
  links:        { genre: "other",         category: "useful-site" },
  sns:          { genre: "media-sns",     category: "influencer" },
  organization: { genre: "org-consult",   category: "npo" },
  tstg:         { genre: "org-consult",   category: "volunteer" },
  yaoi:         { genre: "video-gallery", category: "contents" },
  book:         { genre: "media-sns",     category: "publishing" },
  // gpress の "app" カテゴリは Apparel (服飾) — マッチングアプリではない
  app:          { genre: "fashion-beauty", category: "shop" },
  etc:          { genre: "other",         category: "useful-site" },
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

function inferOsakaArea(cityJp) {
  if (!cityJp) return null;
  for (const [re, slug] of OSAKA_AREA_PATTERNS) {
    if (re.test(cityJp)) return slug;
  }
  return null;
}

// ===== メイン =====

async function readJsonOrEmpty(p) {
  try {
    const txt = await readFile(p, "utf8");
    const parsed = JSON.parse(txt);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function main() {
  const gclickRaw = await readJsonOrEmpty(GCLICK_RAW_PATH);
  const gpressRaw = await readJsonOrEmpty(GPRESS_RAW_PATH);
  const rng = makeRng(20260505);

  const lines = [];
  lines.push("-- AUTO-GENERATED by app/scripts/build-seed-sql.mjs");
  lines.push("-- Sources: gclick.jp + gpress.com (real names + URLs preserved)");
  lines.push("-- D1 auto-wraps multi-statement files; do not emit explicit BEGIN/COMMIT.");
  lines.push("");
  lines.push(`-- Idempotent: remove previous test data inserted by this admin user`);
  lines.push(`DELETE FROM listings WHERE user_id = '${ADMIN_USER_ID}';`);
  lines.push("");

  const listingInserts = [];
  const linkInserts = [];
  const stats = {
    titleClipped: 0,
    descClipped: 0,
    wardSet: 0,
    gclick: 0,
    gpress: 0,
    skipped: 0,
  };
  let seq = 0;

  function emitListing(opts) {
    const {
      genreSlug,
      title,
      description,
      websiteUrl,
      prefSlug = null,
      wardSlug = null,
      serviceAreas = null,
      providerAges = null,
      categorySlugs = [],
    } = opts;
    const genreId = GENRE_ID[genreSlug];
    if (!genreId) return;
    const id = randomUUID();
    const clickCount = Math.floor(rng() * 50);
    const daysAgo = Math.floor(rng() * 30);
    const ts = `datetime('now', '-${daysAgo} days')`;

    listingInserts.push(
      `INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, service_areas, provider_ages, status, click_count, created_by, updated_by, created_at, updated_at) VALUES (` +
      `${sqlStr(id)}, ${sqlStr(ADMIN_USER_ID)}, ${sqlStr(genreId)}, ${sqlStr(title)}, ${sqlStr(description)}, NULL, ${sqlStr(websiteUrl)}, ${sqlStr(prefSlug)}, ${sqlStr(wardSlug)}, ${sqlStr(serviceAreas)}, ${sqlStr(providerAges)}, 'published', ${sqlNum(clickCount)}, ${sqlStr(ADMIN_USER_ID)}, ${sqlStr(ADMIN_USER_ID)}, ${ts}, ${ts}` +
      `);`,
    );
    for (const catSlug of categorySlugs) {
      const catId = CATEGORY_ID[genreSlug]?.[catSlug];
      if (!catId) continue;
      linkInserts.push(
        `INSERT OR IGNORE INTO listing_categories (listing_id, category_id) VALUES (${sqlStr(id)}, ${sqlStr(catId)});`,
      );
    }
  }

  // ---- gclick ----
  for (const r of gclickRaw) {
    seq++;
    const genreSlug = GCLICK_TO_GENRE[r.gclick_genre];
    if (!genreSlug || !GENRE_ID[genreSlug]) {
      stats.skipped++;
      continue;
    }
    const titleRaw = (r.name || "").trim();
    if (!titleRaw) {
      stats.skipped++;
      continue;
    }
    const title = clipChars(titleRaw, 20);
    if (title !== titleRaw) stats.titleClipped++;

    const descRaw =
      (r.description || "").trim() ||
      `${r.prefecture_jp ?? ""} ${r.city_jp ?? ""}の店舗`.trim();
    const description = clipChars(descRaw, 100);
    if (description !== descRaw) stats.descClipped++;

    // 公式サイト or X/IG が無い gclick listing はスキップ
    if (!r.homepage_url && !r.social_url) {
      stats.skipped++;
      continue;
    }
    const websiteUrl = r.homepage_url || r.social_url;

    const prefSlug = PREFECTURE_SLUG[r.prefecture_jp] ?? null;
    let wardSlug = null;
    if (prefSlug === "tokyo") {
      wardSlug = inferTokyoWard(r.city_jp);
      if (wardSlug) stats.wardSet++;
    } else if (prefSlug === "osaka") {
      wardSlug = inferOsakaArea(r.city_jp);
      if (wardSlug) stats.wardSet++;
    }

    const candidates = GCLICK_TO_CATEGORY_CANDIDATES[r.gclick_genre] ?? [];
    const catSlugs = pickN(
      rng,
      candidates,
      1 + Math.floor(rng() * Math.min(2, candidates.length)),
    );

    emitListing({
      genreSlug,
      title,
      description,
      websiteUrl,
      prefSlug,
      wardSlug,
      categorySlugs: catSlugs,
    });
    stats.gclick++;
  }

  // ---- gpress ----
  for (const r of gpressRaw) {
    seq++;
    const map = GPRESS_TO_GENRE[r.gpress_category];
    if (!map || !GENRE_ID[map.genre]) {
      stats.skipped++;
      continue;
    }
    const titleRaw = (r.name || "").trim();
    if (!titleRaw) {
      stats.skipped++;
      continue;
    }
    const title = clipChars(titleRaw, 20);
    if (title !== titleRaw) stats.titleClipped++;

    const descRaw = (r.description || "").trim() || titleRaw;
    const description = clipChars(descRaw, 100);
    if (description !== descRaw) stats.descClipped++;

    if (!r.website_url || !/^https?:\/\//.test(r.website_url)) {
      stats.skipped++;
      continue;
    }
    const websiteUrl = r.website_url;

    emitListing({
      genreSlug: map.genre,
      title,
      description,
      websiteUrl,
      categorySlugs: [map.category],
    });
    stats.gpress++;
  }

  lines.push(`-- ${listingInserts.length} listings (gclick=${stats.gclick}, gpress=${stats.gpress})`);
  lines.push(...listingInserts);
  lines.push("");
  lines.push(`-- ${linkInserts.length} category links`);
  lines.push(...linkInserts);
  lines.push("");

  await writeFile(OUT_PATH, lines.join("\n"), "utf8");
  console.log(
    `Wrote ${listingInserts.length} listings + ${linkInserts.length} category links to ${OUT_PATH}\n` +
      `  gclick: ${stats.gclick}, gpress: ${stats.gpress}, skipped: ${stats.skipped}\n` +
      `  titles clipped to 20 chars: ${stats.titleClipped}\n` +
      `  descriptions clipped to 100 chars: ${stats.descClipped}\n` +
      `  Tokyo ward inferred: ${stats.wardSet}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
