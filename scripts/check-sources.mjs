import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCHEMES_PATH = path.resolve(here, "..", "src", "data", "schemes.json");
const HASHES_PATH = path.resolve(here, "source-hashes.json");
const TIMEOUT_MS = 10_000;
const ACCEPT = process.argv.includes("--accept");

function extractSchemes(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.schemes)) return data.schemes;
  throw new Error("schemes.json has no schemes array");
}

function pageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "claim-what-is-yours-source-check/1.0" },
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true, text: pageText(await res.text()) };
  } catch (err) {
    const reason = err?.name === "AbortError" ? "timeout after 10s" : (err?.message ?? String(err));
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

async function main() {
  const schemes = extractSchemes(await loadJson(SCHEMES_PATH, null));
  const stored = await loadJson(HASHES_PATH, {});
  const next = { ...stored };
  const now = new Date().toISOString();

  for (const scheme of schemes) {
    const id = scheme.id;
    const url = scheme.official_url;
    if (!url) {
      console.log(`UNREACHABLE  ${id}  (no official_url)`);
      continue;
    }
    const result = await fetchText(url);
    if (!result.ok) {
      console.log(`UNREACHABLE  ${id}  ${url}  (${result.reason})`);
      continue;
    }
    const hash = createHash("sha256").update(result.text, "utf8").digest("hex");
    const prev = stored[id];
    if (!prev) {
      next[id] = { url, hash, checked_at: now };
      console.log(`BASELINE     ${id}  first run, hash saved`);
    } else if (prev.hash === hash) {
      next[id] = { ...prev, url, checked_at: now };
      console.log(`UNCHANGED    ${id}`);
    } else if (ACCEPT) {
      next[id] = { url, hash, checked_at: now };
      console.log(`CHANGED (check manually)  ${id}  ${url}  (accepted with --accept)`);
    } else {
      console.log(`CHANGED (check manually)  ${id}  ${url}`);
    }
  }

  await writeFile(HASHES_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log(`\nHashes saved to ${path.relative(process.cwd(), HASHES_PATH)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
