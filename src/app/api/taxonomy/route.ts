import { NextRequest, NextResponse } from "next/server";
import { getTaxonomy } from "@/lib/taxonomy";
import { TAXONOMY_KINDS, type TaxonomyKind } from "@/lib/taxonomy-baseline";

const KINDS = TAXONOMY_KINDS;

/**
 * Read-only feed of the admin-managed lists, so the post-job form and the
 * public filters show exactly what the admin panel manages. GET-only and
 * unauthenticated — these are the same options already visible on every form.
 */
export async function GET(req: NextRequest) {
  const requested = new URL(req.url).searchParams.get("kind");

  if (requested) {
    if (!KINDS.includes(requested as TaxonomyKind)) {
      return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
    }
    return NextResponse.json({ items: await getTaxonomy(requested as TaxonomyKind) });
  }

  const all = await Promise.all(KINDS.map((kind) => getTaxonomy(kind)));
  return NextResponse.json(Object.fromEntries(KINDS.map((kind, i) => [kind, all[i]])));
}
