// One-off: fetch gclick genre=20 (ミックスバー) listing, then each detail page,
// keep only stores that publish a 公式サイト URL, return first 10.
// Output: scripts/data/gclick-mixed-bars.json
import { writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://www.gclick.jp";
// CLI: node scrape-gclick-mixed-bars.mjs [listUrl] [outFile]
const LIST_URL =
  process.argv[2] || `${BASE}/search_list.php?genre=20`;
const OUT_NAME =
  process.argv[3] || "gclick-mixed-bars.json";
const OUT = path.join(__dirname, "data", OUT_NAME);
const UA = "G-Ankers-test-seeding/1.0 (private dev)";
const WANT = Number(process.argv[4]) || 10;
const MAX_FETCH = 60;

function pickHomepageUrl(doc) {
  for (const dt of doc.querySelectorAll("dt")) {
    if ((dt.textContent || "").trim() !== "サイト") continue;
    const dd = dt.nextElementSibling;
    if (!dd || dd.tagName !== "DD") continue;
    const a = dd.querySelector("a[href]");
    if (!a) return null;
    const href = a.getAttribute("href");
    if (!href || !/^https?:\/\//i.test(href)) return null;
    return href;
  }
  return null;
}

// 詳細ページから店舗の X (旧Twitter) アカウント URL を抽出する。
// 共有ボタンやハッシュタグページ等は除外し、ユーザ単体ページ URL のみ返す。
const X_BLOCK = new Set(["share", "intent", "hashtag", "search", "home", "i", "_"]);
function pickXUrl(doc) {
  const anchors = [...doc.querySelectorAll("a[href]")];
  for (const a of anchors) {
    const raw = a.getAttribute("href") || "";
    if (!raw) continue;
    const noQuery = raw.split("?")[0].split("#")[0].replace(/\/$/, "");
    const m = noQuery.match(/^https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([A-Za-z0-9_]{1,15})$/);
    if (m && !X_BLOCK.has(m[1].toLowerCase())) {
      return `https://x.com/${m[1]}`;
    }
  }
  return null;
}

function pickDescription(doc) {
  // Try common spots: meta description fallback to first <p> in main content
  const meta = doc.querySelector('meta[name="description"]');
  if (meta) {
    const c = meta.getAttribute("content");
    if (c && c.trim()) return c.trim();
  }
  return null;
}

function pickArea(doc) {
  // gclick detail page typically has <dt>都道府県</dt><dd>東京都</dd>, <dt>エリア</dt><dd>...
  const out = { prefecture: null, area: null, address: null };
  for (const dt of doc.querySelectorAll("dt")) {
    const label = (dt.textContent || "").trim();
    const dd = dt.nextElementSibling;
    if (!dd || dd.tagName !== "DD") continue;
    const val = (dd.textContent || "").trim();
    if (label === "都道府県") out.prefecture = val;
    else if (label === "エリア") out.area = val;
    else if (label === "住所") out.address = val;
  }
  return out;
}

async function main() {
  console.log(`Fetching list: ${LIST_URL}`);
  const res = await fetch(LIST_URL, {
    headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
  });
  if (!res.ok) throw new Error(`list fetch failed: ${res.status}`);
  const doc = new JSDOM(await res.text()).window.document;

  // each store row links to /detail.php?NO=... — collect them
  const seen = new Set();
  const candidates = [];
  for (const a of doc.querySelectorAll('a[href*="/detail.php?NO="]')) {
    const href = a.getAttribute("href") || "";
    const m = href.match(/\/detail\.php\?NO=([^&"#]+)/);
    if (!m) continue;
    const no = m[1];
    if (seen.has(no)) continue;
    seen.add(no);
    const name = (a.textContent || "").trim();
    if (!name) continue;
    const absUrl = href.startsWith("http") ? href : `${BASE}${href.startsWith("/") ? "" : "/"}${href}`;
    candidates.push({ no, name, detail_url: absUrl });
    if (candidates.length >= MAX_FETCH) break;
  }

  console.log(`Found ${candidates.length} candidate detail pages`);

  const accepted = [];
  for (const c of candidates) {
    if (accepted.length >= WANT) break;
    try {
      const r = await fetch(c.detail_url, {
        headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
      });
      if (!r.ok) {
        console.log(`  skip ${c.name}: HTTP ${r.status}`);
        continue;
      }
      const d = new JSDOM(await r.text()).window.document;
      let homepage = pickHomepageUrl(d);
      let homepageSource = "site";
      if (!homepage) {
        // 公式サイトがない場合は X (Twitter) アカウントをフォールバックとして許容
        const x = pickXUrl(d);
        if (x) {
          homepage = x;
          homepageSource = "x";
        } else {
          console.log(`  skip ${c.name}: no homepage / no X`);
          continue;
        }
      }
      // URL が実際に到達可能かを確認 (GET, 10s timeout)
      let reachable = false;
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 10000);
        const hr = await fetch(homepage, {
          method: "GET",
          headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
          redirect: "follow",
          signal: ctrl.signal,
        });
        clearTimeout(tid);
        reachable = hr.ok || (hr.status >= 200 && hr.status < 400);
        if (!reachable) {
          console.log(`  skip ${c.name}: ${homepageSource} HTTP ${hr.status} (${homepage})`);
          continue;
        }
      } catch (e) {
        console.log(`  skip ${c.name}: ${homepageSource} unreachable (${e.message}) (${homepage})`);
        continue;
      }
      const desc = pickDescription(d);
      const loc = pickArea(d);
      console.log(`  ✓ ${c.name} -> ${homepage} (${homepageSource})`);
      accepted.push({
        name: c.name,
        detail_url: c.detail_url,
        homepage,
        homepage_source: homepageSource,
        description: desc,
        prefecture_jp: loc.prefecture,
        area_jp: loc.area,
        address: loc.address,
      });
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      console.warn(`  err ${c.name}: ${e.message}`);
    }
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(accepted, null, 2), "utf8");
  console.log(`\nWrote ${accepted.length} stores to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
