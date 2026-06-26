import { search } from "@/lib/title-index";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

// Reading request.url makes this handler dynamic (run per request), which is
// what we want — results depend on the query string, nothing is prerendered.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const results = search(query, limit);

  // Echo the query back so the client can discard stale (out-of-order) responses.
  return Response.json({ query, results });
}
