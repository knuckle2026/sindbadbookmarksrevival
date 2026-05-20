// One-off: fetch gpress.com SM category, test reachability, output to JSON.
import { writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "data", "gpress-sm.json");
const BASE = "https://www.gpress.com";
const UA = "G-Ankers-test-seeding/1.0 (private dev)";
const STARTS = [0, 10];

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
  const all = [];
  for (const s of STARTS) {
    const url = `${BASE}/cgi-bin/gixsearch3.cgi?start=${s}&category=sm`;
    console.log(`Fetching ${url}`);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.5" },
    });
    if (!res.ok) {
      console.warn(`  HTTP ${res.status}`);
      break;
    }
    const items = parseListPage(await res.text());
    console.log(`  Found ${items.length}`);
    if (items.length === 0) break;
    all.push(...items);
    if (items.length < 10) break;
    await new Promise((r) => setTimeout(r, 800));
  }

  // dedupe by url
  const seen = new Set();
  const uniq = [];
  for (const it of all) {
    if (seen.has(it.website_url)) continue;
    seen.add(it.website_url);
    uniq.push(it);
  }

  console.log(`\nReachability test on ${uniq.length} URLs...`);
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
