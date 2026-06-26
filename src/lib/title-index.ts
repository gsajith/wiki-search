import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// Same comparator module the offline pre-sort used — see comparator.mjs.
import { sortKey } from "@/lib/comparator.mjs";

const ARTIFACT = resolve(process.cwd(), "wikipedia-latest-titles.sorted.txt");

// The index is large (~7.2M titles) and expensive to load, so it's built once
// and cached on globalThis. globalThis survives Next's dev HMR module reloads,
// which a plain module-scoped variable would not.
const globalForIndex = globalThis as unknown as {
  __titleIndex?: string[];
};

/**
 * Load the pre-sorted titles into memory, building the array only on the first
 * call. The first call reads + splits ~143MB and takes a couple of seconds;
 * every later call reuses the cached array.
 */
function getTitles(): string[] {
  if (!globalForIndex.__titleIndex) {
    const raw = readFileSync(ARTIFACT, "utf8");
    globalForIndex.__titleIndex = raw.split("\n").filter((line) => line.length > 0);
  }
  return globalForIndex.__titleIndex;
}

/**
 * Index of the first title whose sort key is >= `key` (a lower bound). Standard
 * binary search; comparisons use the same lowercased sort key the file is
 * sorted by, so the search order matches the on-disk order exactly.
 */
function lowerBound(titles: string[], key: string): number {
  let lo = 0;
  let hi = titles.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sortKey(titles[mid]) < key) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Prefix search. Returns up to `limit` original-case titles whose sort key
 * starts with the (lowercased) query prefix, in sorted order. Case-insensitive
 * because both sides go through `sortKey`.
 */
export function search(query: string, limit = 10): string[] {
  const prefix = sortKey(query.trim());
  if (prefix.length === 0) return [];

  const titles = getTitles();
  const start = lowerBound(titles, prefix);

  const results: string[] = [];
  for (let i = start; i < titles.length && results.length < limit; i++) {
    if (!sortKey(titles[i]).startsWith(prefix)) break;
    results.push(titles[i]);
  }
  return results;
}
