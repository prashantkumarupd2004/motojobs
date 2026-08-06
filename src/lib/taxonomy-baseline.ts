import {
  JOB_CATEGORIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  QUALIFICATIONS,
  INDUSTRIES,
} from '@/lib/automotive';

/**
 * The shipped baseline for each admin-managed list.
 *
 * Kept apart from `taxonomy.ts` because that module imports Prisma: client
 * components need the fallback list without dragging the database client into
 * the browser bundle.
 */

export type TaxonomyKind =
  | 'JOB_CATEGORY'
  | 'INDUSTRY'
  | 'EXPERIENCE_LEVEL'
  | 'EMPLOYMENT_TYPE'
  | 'QUALIFICATION';

export interface TaxonomyOption {
  value: string;
  label: string;
  blurb: string | null;
  group: string | null;
}

/**
 * `value` is what jobs and profiles persist. For categories it is the slug the
 * existing rows already carry, so seeding must not invent new ones.
 */
export const BASELINE: Record<TaxonomyKind, TaxonomyOption[]> = {
  JOB_CATEGORY: JOB_CATEGORIES.map((c) => ({
    value: c.id,
    label: c.label,
    blurb: c.blurb,
    group: null,
  })),
  EMPLOYMENT_TYPE: JOB_TYPES.map((t) => ({ value: t, label: t, blurb: null, group: null })),
  EXPERIENCE_LEVEL: EXPERIENCE_LEVELS.map((e) => ({ value: e, label: e, blurb: null, group: null })),
  QUALIFICATION: QUALIFICATIONS.map((q) => ({ value: q, label: q, blurb: null, group: null })),
  INDUSTRY: INDUSTRIES.map((i) => ({ value: i, label: i, blurb: null, group: null })),
};

export const TAXONOMY_KINDS = Object.keys(BASELINE) as TaxonomyKind[];

export function baselineTaxonomy(kind: TaxonomyKind): TaxonomyOption[] {
  return BASELINE[kind];
}
