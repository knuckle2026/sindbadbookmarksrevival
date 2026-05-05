/**
 * gclick.jp の各都市/カテゴリ一覧ページから店舗データを実取得する。
 *
 * 出力: scripts/data/gclick-raw.json
 *
 * 各レコード:
 *   - gclick_genre: gaybar / hatten / urisen / massage
 *   - name:         店名（カナ読みは除去）
 *   - detail_url:   gclick 詳細ページの絶対 URL
 *   - prefecture_jp: "東京都" 等
 *   - city_jp:      "新宿2丁目" / "上野" 等（gclick が ( ) で出している部分）
 *   - description:  店舗紹介文（gclick リスト上のもの）
 */

import { writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "data", "gclick-raw.json");

const UA = "G-Ankers-test-seeding/1.0 (private dev)";
const BASE = "https://www.gclick.jp";
const TARGET_COUNT = 50;

// 取得対象 (ジャンル, パス). ジャンル偏りを避けるため複数都市を回す。
const TARGETS = [
  // gaybar
  ["gaybar",  "/gaybar/shinjuku2choume.php"],
  ["gaybar",  "/gaybar/shinbashi.php"],
  ["gaybar",  "/gaybar/ueno.php"],
  ["gaybar",  "/gaybar/osaka-minami.php"],
  ["gaybar",  "/gaybar/sapporo.php"],
  ["gaybar",  "/gaybar/nagoya.php"],
  // hatten
  ["hatten",  "/hatten/ueno.php"],
  ["hatten",  "/hatten/shinbashi.php"],
  ["hatten",  "/hatten/shinjuku2choume.php"],
  // massage
  ["massage", "/massage/ueno.php"],
  ["massage", "/massage/nishishinjuku.php"],
  ["massage", "/massage/nagoya.php"],
  // urisen
  ["urisen",  "/urisen/yokohama.php"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PREFS = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県",
  "三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];
const PREF_RE = new RegExp(`(${PREFS.join("|")})`);

/**
 * gclick の <li> の text から構造的に分解する。
 * 典型形:
 *   "店名 (カナ)東京都 (新宿2丁目) / ジャンル ... 紹介文..."
 */
function parseListItem(rawText) {
  const text = rawText.replace(/\s+/g, " ").trim();
  if (!text) return null;

  // 都道府県の出現位置で前後分割
  const m = PREF_RE.exec(text);
  if (!m) return null;
  const prefIdx = m.index;
  const prefecture = m[1];

  // 名前部分: 都道府県より前。さらに末尾の「 (カナ)」を取り除く。
  let namePart = text.slice(0, prefIdx).trim();
  namePart = namePart.replace(/\s*\([^)]+\)\s*$/, "").trim();

  // 都道府県の直後: " (xxx)" が市区町村
  const after = text.slice(prefIdx + prefecture.length);
  const cityMatch = after.match(/^\s*\(([^)]+)\)/);
  const cityJp = cityMatch ? cityMatch[1].trim() : null;

  // 残り (ジャンル + 紹介文)
  const tail = cityMatch ? after.slice(cityMatch[0].length).trim() : after.trim();
  // " / カテゴリ" を除去して説明文を取り出す
  const descRaw = tail.replace(/^\/\s*[^ ]+\s*/, "").trim();
  // カテゴリの (...) を除去して残った説明
  const description = descRaw.replace(/^\([^)]+\)\s*/, "").trim();

  return {
    name: namePart,
    prefecture_jp: prefecture,
    city_jp: cityJp,
    description: description.slice(0, 300), // パース用の中間値; 後段で 100 文字制約に丸める
  };
}

// gclick の詳細ページから X (twitter/x.com) または Instagram の店舗アカウントURLを抽出する。
// 共有ボタンや埋め込み (twitter.com/share, ?ref_src=twsrc 付き等) は除外。
const TW_BLOCK = new Set(["share", "intent", "hashtag", "search", "home", "i", "_"]);
const IG_BLOCK = new Set(["p", "reel", "accounts", "explore", "share", "hashtag", "embed", "stories"]);

function pickSocialUrl(html) {
  const dom = new JSDOM(html);
  const anchors = [...dom.window.document.querySelectorAll("a[href]")];
  const hrefs = anchors.map((a) => a.getAttribute("href") || "");

  let tw = null;
  let ig = null;
  for (const raw of hrefs) {
    if (!raw) continue;
    const noQuery = raw.split("?")[0].split("#")[0].replace(/\/$/, "");
    if (!tw) {
      const m = noQuery.match(/^https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([A-Za-z0-9_]{1,15})$/);
      if (m && !TW_BLOCK.has(m[1].toLowerCase())) {
        tw = `https://x.com/${m[1]}`;
      }
    }
    if (!ig) {
      const m = noQuery.match(/^https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9_.]{1,30})$/);
      if (m && !IG_BLOCK.has(m[1].toLowerCase())) {
        ig = `https://www.instagram.com/${m[1]}/`;
      }
    }
    if (tw && ig) break;
  }
  return tw || ig || null; // X 優先、なければ IG、両方なければ null
}

async function fetchDetailSocial(detailUrl) {
  try {
    const res = await fetch(detailUrl, {
      headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
    });
    if (!res.ok) return null;
    return pickSocialUrl(await res.text());
  } catch (e) {
    console.warn(`  detail fetch failed for ${detailUrl}: ${e.message}`);
    return null;
  }
}

async function fetchListingPage(genre, path_) {
  const url = BASE + path_;
  console.log(`  fetching ${url}`);
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
  });
  if (!res.ok) {
    console.warn(`    ${res.status} ${res.statusText}, skipping`);
    return [];
  }
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // 同一 NO の重複を除く (画像リンクと文字リンクが両方ある)
  const seen = new Set();
  const records = [];
  const anchors = doc.querySelectorAll("a[href*='/detail.php?NO=']");
  for (const a of anchors) {
    const href = a.getAttribute("href");
    if (!href) continue;
    const noMatch = href.match(/NO=(\w+)/);
    if (!noMatch) continue;
    const no = noMatch[1];
    if (seen.has(no)) continue;

    // テキストが入っている方を優先
    const text = (a.textContent || "").trim();
    if (!text) continue;
    seen.add(no);

    const parsed = parseListItem(text);
    if (!parsed || !parsed.name) continue;

    records.push({
      gclick_genre: genre,
      name: parsed.name,
      detail_url: BASE + href,
      prefecture_jp: parsed.prefecture_jp,
      city_jp: parsed.city_jp,
      description: parsed.description,
    });
  }
  return records;
}

// 1 ページあたりの最大採用件数。ジャンル/エリアの偏りを抑えるため。
const PER_PAGE_CAP = 5;

async function main() {
  const all = [];
  for (const [genre, p] of TARGETS) {
    if (all.length >= TARGET_COUNT) break;
    try {
      const recs = await fetchListingPage(genre, p);
      const taken = recs.slice(0, PER_PAGE_CAP);
      all.push(...taken);
      console.log(`  -> ${taken.length}/${recs.length} from ${p}, total ${all.length}`);
    } catch (e) {
      console.warn(`  failed: ${e.message}`);
    }
    await sleep(1500); // rate limit 配慮
  }

  // 50 件で打ち切り
  const trimmed = all.slice(0, TARGET_COUNT);

  // 各詳細ページから X / Instagram アカウントを取得
  console.log(`Fetching ${trimmed.length} detail pages for X/IG URLs...`);
  let tally = { social: 0, none: 0 };
  for (const r of trimmed) {
    const social = await fetchDetailSocial(r.detail_url);
    r.social_url = social;
    if (social) tally.social++;
    else tally.none++;
    await sleep(1500);
  }
  console.log(`  with X/IG: ${tally.social}, without: ${tally.none}`);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(trimmed, null, 2), "utf8");
  console.log(`Wrote ${trimmed.length} records to ${OUTPUT_PATH}`);

  // 簡単な分布サマリ
  const byGenre = {};
  const byPref = {};
  for (const r of trimmed) {
    byGenre[r.gclick_genre] = (byGenre[r.gclick_genre] ?? 0) + 1;
    byPref[r.prefecture_jp]  = (byPref[r.prefecture_jp]  ?? 0) + 1;
  }
  console.log("by gclick_genre:", byGenre);
  console.log("by prefecture:",   byPref);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
