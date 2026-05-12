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
// 0 で無制限。gclick の全ページをクロールする。
const TARGET_COUNT = 0;
// 0 で無制限。各ページの全店舗を採用する。
const PER_PAGE_CAP_OVERRIDE = 0;

// gclick のホームページ <a> リンクから取得対象都市/ジャンルを自動列挙する。
// 失敗時のフォールバックとして、最低限のリストも保持。
async function discoverTargets() {
  try {
    const res = await fetch(BASE + "/", {
      headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
    });
    if (!res.ok) return null;
    const dom = new JSDOM(await res.text());
    const anchors = [...dom.window.document.querySelectorAll("a[href]")];
    const re = /^\/(gaybar|hatten|urisen|massage)\/([^.]+)\.php$/;
    const seen = new Set();
    const out = [];
    for (const a of anchors) {
      const href = a.getAttribute("href") || "";
      const m = href.match(re);
      if (!m) continue;
      if (seen.has(href)) continue;
      seen.add(href);
      out.push([m[1], href]);
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

// 取得対象 (ジャンル, パス). discoverTargets の失敗時のフォールバック。
const TARGETS_FALLBACK = [
  // gaybar
  ["gaybar",  "/gaybar/shinjuku2choume.php"],
  ["gaybar",  "/gaybar/shinbashi.php"],
  ["gaybar",  "/gaybar/ueno.php"],
  ["gaybar",  "/gaybar/shibuya.php"],
  ["gaybar",  "/gaybar/ikebukuro.php"],
  ["gaybar",  "/gaybar/yokohama.php"],
  ["gaybar",  "/gaybar/sapporo.php"],
  ["gaybar",  "/gaybar/sendai.php"],
  ["gaybar",  "/gaybar/nagoya.php"],
  ["gaybar",  "/gaybar/kyoto.php"],
  ["gaybar",  "/gaybar/osaka-minami.php"],
  ["gaybar",  "/gaybar/osaka-doyama.php"],
  ["gaybar",  "/gaybar/hiroshima.php"],
  ["gaybar",  "/gaybar/hakata.php"],
  ["gaybar",  "/gaybar/naha.php"],
  // hatten
  ["hatten",  "/hatten/ueno.php"],
  ["hatten",  "/hatten/shinbashi.php"],
  ["hatten",  "/hatten/shinjuku2choume.php"],
  ["hatten",  "/hatten/ikebukuro.php"],
  ["hatten",  "/hatten/shibuya.php"],
  ["hatten",  "/hatten/yokohama.php"],
  ["hatten",  "/hatten/sapporo.php"],
  ["hatten",  "/hatten/nagoya.php"],
  ["hatten",  "/hatten/osaka-minami.php"],
  ["hatten",  "/hatten/osaka-doyama.php"],
  ["hatten",  "/hatten/hakata.php"],
  // massage
  ["massage", "/massage/ueno.php"],
  ["massage", "/massage/nishishinjuku.php"],
  ["massage", "/massage/shinbashi.php"],
  ["massage", "/massage/shibuya.php"],
  ["massage", "/massage/ikebukuro.php"],
  ["massage", "/massage/yokohama.php"],
  ["massage", "/massage/sapporo.php"],
  ["massage", "/massage/nagoya.php"],
  ["massage", "/massage/kyoto.php"],
  ["massage", "/massage/osaka-minami.php"],
  ["massage", "/massage/osaka-doyama.php"],
  ["massage", "/massage/hakata.php"],
  // urisen
  ["urisen",  "/urisen/yokohama.php"],
  ["urisen",  "/urisen/ueno.php"],
  ["urisen",  "/urisen/shinjuku2choume.php"],
  ["urisen",  "/urisen/osaka-minami.php"],
  ["urisen",  "/urisen/sapporo.php"],
  ["urisen",  "/urisen/nagoya.php"],
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

// gclick の <dt>サイト</dt><dd>...</dd> から店舗の公式ホームページ URL を取り出す。
// 「ホームページはありません」の場合は null。
function pickHomepageUrl(doc) {
  const dts = [...doc.querySelectorAll("dt")];
  for (const dt of dts) {
    if ((dt.textContent || "").trim() !== "サイト") continue;
    const dd = dt.nextElementSibling;
    if (!dd || dd.tagName !== "DD") continue;
    const a = dd.querySelector("a[href]");
    if (!a) return null; // "ホームページはありません" の場合
    const href = a.getAttribute("href");
    if (!href) return null;
    if (!/^https?:\/\//i.test(href)) return null;
    return href;
  }
  return null;
}

function pickSocialUrl(doc) {
  const anchors = [...doc.querySelectorAll("a[href]")];
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
  return tw || ig || null; // X 優先、なければ IG
}

async function fetchDetailUrls(detailUrl) {
  try {
    const res = await fetch(detailUrl, {
      headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
    });
    if (!res.ok) return { homepage: null, social: null };
    const dom = new JSDOM(await res.text());
    const doc = dom.window.document;
    return {
      homepage: pickHomepageUrl(doc),
      social: pickSocialUrl(doc),
    };
  } catch (e) {
    console.warn(`  detail fetch failed for ${detailUrl}: ${e.message}`);
    return { homepage: null, social: null };
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

// 1 ページあたりの最大採用件数 (PER_PAGE_CAP_OVERRIDE が 0 なら無制限)。
const DEFAULT_PER_PAGE_CAP = 15;

async function main() {
  const discovered = await discoverTargets();
  const targets = discovered ?? TARGETS_FALLBACK;
  console.log(`Targets: ${targets.length} pages (${discovered ? "discovered" : "fallback"})`);

  const all = [];
  const cap =
    PER_PAGE_CAP_OVERRIDE > 0 ? PER_PAGE_CAP_OVERRIDE : Infinity;
  const targetCount = TARGET_COUNT > 0 ? TARGET_COUNT : Infinity;

  for (const [genre, p] of targets) {
    if (all.length >= targetCount) break;
    try {
      const recs = await fetchListingPage(genre, p);
      const taken = cap === Infinity ? recs : recs.slice(0, cap);
      all.push(...taken);
      console.log(`  -> ${taken.length}/${recs.length} from ${p}, total ${all.length}`);
    } catch (e) {
      console.warn(`  failed: ${e.message}`);
    }
    await sleep(800); // rate limit 配慮
  }

  const trimmed = targetCount === Infinity ? all : all.slice(0, targetCount);

  // 各詳細ページから 公式サイト + X/Instagram を取得
  console.log(`Fetching ${trimmed.length} detail pages for homepage / X / IG URLs...`);
  const tally = { homepage: 0, social: 0, none: 0 };
  for (const r of trimmed) {
    const { homepage, social } = await fetchDetailUrls(r.detail_url);
    r.homepage_url = homepage;
    r.social_url = social;
    if (homepage) tally.homepage++;
    else if (social) tally.social++;
    else tally.none++;
    await sleep(500);
  }
  console.log(
    `  with homepage: ${tally.homepage}, with X/IG only: ${tally.social}, neither: ${tally.none}`,
  );

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
