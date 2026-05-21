// gpress.com の任意の検索URLを叩いてリスト取得 + 接続確認。
// 使い方:
//   node app/scripts/scrape-gpress-search.mjs "<URL>" <out_filename>
import { writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL_ARG = process.argv[2];
const OUT_NAME = process.argv[3] || "gpress-search.json";
if (!URL_ARG) {
  console.error("Usage: node scrape-gpress-search.mjs <URL> [out_filename]");
  process.exit(1);
}
const OUT = path.join(__dirname, "data", OUT_NAME);
const UA = "G-Ankers-test-seeding/1.0 (private dev)";

function parseListPage(html) {
  const dom = new JSDOM(html);
  const lis = dom.window.document.querySelectorAll("ul.list_out li");
  const out = [];
  for (const li of lis) {
    const links = [...li.querySelectorAll("a[href]")];
    if (links.length === 0) continue;
    const first = links[0];
    const href = first.getAttribute("href") || "";
    const name = (first.textContent || "").trim();
    if (!href || !/^https?:\/\//i.test(href)) continue;
    if (href.includes("gpress.com") || href.includes("gix.jp")) continue;
    if (!name) continue;
    const text = (li.textContent || "").replace(/\s+/g, " ").trim();
    const idx = text.indexOf("[QR]");
    let description = idx >= 0 ? text.slice(idx + 4).trim() : "";
    description = description.replace(/^[\s.]+/, "").slice(0, 400);
    if (!description) description = name;
    out.push({ name, website_url: href, description });
  }
  return out;
}

async function reachable(url) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    return r.status >= 200 && r.status < 400;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`Fetching ${URL_ARG}`);
  const res = await fetch(URL_ARG, {
    headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status}`);
    process.exit(1);
  }
  const items = parseListPage(await res.text());
  const seen = new Set();
  const uniq = items.filter((x) => {
    if (seen.has(x.website_url)) return false;
    seen.add(x.website_url);
    return true;
  });
  console.log(`Found ${uniq.length} unique items, testing reachability...`);

  const reachableList = [];
  for (const it of uniq) {
    const ok = await reachable(it.website_url);
    console.log(`  ${ok ? "✓" : "✗"} ${it.name} -> ${it.website_url}`);
    if (ok) reachableList.push(it);
    await new Promise((r) => setTimeout(r, 200));
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(reachableList, null, 2), "utf8");
  console.log(`\nWrote ${reachableList.length} reachable stores to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
