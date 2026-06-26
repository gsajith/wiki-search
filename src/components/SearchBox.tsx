"use client";

import { useEffect, useState } from "react";

const DEBOUNCE_MS = 120;

type SearchResponse = { query: string; results: string[] };

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    // Abort the previous in-flight request when the query changes, so a slow
    // response for an older query can't clobber a newer one.
    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data: SearchResponse = await res.json();
        // Stale-response guard: only render if this response is for the query
        // currently in the box (belt-and-suspenders on top of the abort).
        if (data.query === q) {
          setResults(data.results);
          setLoading(false);
        }
      } catch (err) {
        // Aborted requests are expected; ignore them. Surface anything else by
        // clearing the loading state.
        if ((err as Error).name !== "AbortError") {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const trimmed = query.trim();
  const showEmpty = !loading && trimmed !== "" && results.length === 0;

  return (
    <div className="w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Wikipedia titles…"
        autoFocus
        aria-label="Search Wikipedia titles"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <div className="mt-3 min-h-6 text-sm">
        {loading && <p className="text-zinc-500">Searching…</p>}
        {showEmpty && <p className="text-zinc-500">No matches.</p>}
        {!loading && results.length > 0 && (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {results.map((title) => (
              <li
                key={title}
                className="px-4 py-2 text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                {title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
