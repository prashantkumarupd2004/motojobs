import { prisma } from '@/lib/prisma';
import { BASELINE, type TaxonomyKind, type TaxonomyOption } from '@/lib/taxonomy-baseline';

export type { TaxonomyKind, TaxonomyOption };

/**
 * One source of truth for the admin-managed lists.
 *
 * The lists in `automotive.ts` are the shipped baseline, not the live list.
 * They are seeded into `Taxonomy` on first read so the admin panel can rename,
 * reorder, deactivate or extend any of them — before this, admin additions went
 * into the table while every form kept reading the hardcoded array, so a newly
 * added category appeared nowhere.
 */

/** Seeded at most once per kind per process — this sits on a public read path. */
const seeded = new Set<TaxonomyKind>();

async function ensureSeeded(kind: TaxonomyKind) {
  if (seeded.has(kind)) return;
  seeded.add(kind);

  try {
    // `skipDuplicates` against the @@unique([kind, value]) makes this safe to
    // run concurrently and safe to re-run after an admin edits a label.
    await prisma.taxonomy.createMany({
      data: BASELINE[kind].map((item, index) => ({
        kind,
        value: item.value,
        label: item.label,
        blurb: item.blurb,
        group: item.group,
        sortOrder: index,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    // A seeding failure must not take down the page that asked for the list;
    // the caller falls back to the baseline below.
    seeded.delete(kind);
    console.error(`Taxonomy seed failed for ${kind}:`, error);
  }
}

export async function getTaxonomy(kind: TaxonomyKind): Promise<TaxonomyOption[]> {
  try {
    await ensureSeeded(kind);
    const items = await prisma.taxonomy.findMany({
      where: { kind, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: { value: true, label: true, blurb: true, group: true },
    });
    // An empty table means the seed did not land; showing nothing would leave
    // the post-job form with no categories at all.
    return items.length ? items : BASELINE[kind];
  } catch (error) {
    console.error(`Taxonomy read failed for ${kind}:`, error);
    return BASELINE[kind];
  }
}
