/**
 * gpress.com (gix.jp) のディレクトリから全ジャンル/全ページの登録情報を取得する。
 *
 * 出力: scripts/data/gpress-raw.json
 *
 * 各レコード:
 *   - source:       "gpress"
 *   - gpress_category: gay / live / hiv / match / club / lesbian / novel /
 *                       consultation / links / sns / organization / tstg /
 *                       yaoi / book / app / etc
 *   - name:         サイト名
 *   - website_url:  実 URL (外部サイトの公式 URL)
 *   - description:  ディレクトリの掲載説明文
 */

import { writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "data", "gpress-raw.json");

const UA = "G-Ankers-test-seeding/1.0 (private dev)";
const BASE = "https://www.gpress.com";

const CATEGORIES = [
  "gay", "live", "hiv", "match", "club", "lesbian",
  "novel", "consultation", "links", "sns", "organization",
  "tstg", "yaoi", "book", "app", "etc",
];

const PER_PAGE = 15;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseListPage(html, category) {
  const dom = new JSDOM(html);
  const lis = dom.window.document.querySelectorAll("ul.list_out li");
  const out = [];
  for (const li of lis) {
    const links = [...li.querySelectorAll("a[href]")];
    if (links.length === 0) continue;
    // 最初の <a> がサイト名 + 外部 URL
    const first = links[0];
    const href = first.getAttribute("href") || "";
    const name = (first.textContent || "").trim();
    if (!href || !/^https?:\/\//i.test(href)) continue;
    if (href.includes("gpress.com") || href.includes("gix.jp")) continue;
    if (!name) continue;

    // 説明文は textContent から "[QR] " 以降を取り出す
    const text = (li.textContent || "").replace(/\s+/g, " ").trim();
    const idx = text.indexOf("[QR]");
    let description = idx >= 0 ? text.slice(idx + 4).trim() : "";
    description = description.replace(/^[\s.]+/, "").slice(0, 300);
    if (!description) description = name;

    out.push({
      source: "gpress",
      gpress_category: category,
      name,
      website_url: href,
      description,
    });
  }
  return out;
}

async function fetchCategory(category) {
  let start = 0;
  const all = [];
  while (true) {
    const url = `${BASE}/cgi-bin/gixsearch3.cgi?start=${start}&category=${category}`;
    let html;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
      });
      if (!res.ok) {
        console.warn(`    ${res.status} ${res.statusText} for start=${start}`);
        break;
      }
      html = await res.text();
    } catch (e) {
      console.warn(`    fetch failed: ${e.message}`);
      break;
    }
    const items = parseListPage(html, category);
    if (items.length === 0) break;
    all.push(...items);
    if (items.length < PER_PAGE) break;
    start += PER_PAGE;
    await sleep(700);
  }
  return all;
}

async function main() {
  const all = [];
  for (const c of CATEGORIES) {
    console.log(`Fetching category=${c}...`);
    const recs = await fetchCategory(c);
    all.push(...recs);
    console.log(`  -> ${recs.length} from ${c}, total ${all.length}`);
    await sleep(900);
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(all, null, 2), "utf8");
  console.log(`Wrote ${all.length} records to ${OUTPUT_PATH}`);

  const byCategory = {};
  for (const r of all) {
    byCategory[r.gpress_category] = (byCategory[r.gpress_category] ?? 0) + 1;
  }
  console.log("by gpress_category:", byCategory);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
