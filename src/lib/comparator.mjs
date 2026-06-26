// Shared comparator — the single source of truth for title ordering.
//
// The offline pre-sort script and the runtime binary search MUST order titles
// identically, or the binary search will silently skip matching titles. Both
// import THIS file, so the on-disk sort order can never diverge from the search
// order. Do not duplicate this logic anywhere.

/**
 * The key a title is sorted and searched by. Lowercasing here is what makes
 * prefix matching case-insensitive. Uses locale-independent `toLowerCase()`
 * (not `toLocaleLowerCase()`) so ordering is stable regardless of host locale.
 *
 * @param {string} title
 * @returns {string}
 */
export function sortKey(title) {
  return title.toLowerCase();
}

/**
 * Compare two titles by their sort key using default JS string comparison
 * (UTF-16 code-unit order). `Array.prototype.sort` with this comparator and the
 * binary search's `<`/`>` checks both use code-unit order, so they agree.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareByKey(a, b) {
  const ka = sortKey(a);
  const kb = sortKey(b);
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return 0;
}
