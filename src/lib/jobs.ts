/**
 * `Job.skills` is stored as a JSON string (SQLite has no scalar-list columns),
 * but clients and the `Job` type expect `string[]`. Parse on the way out.
 */
export function parseSkills(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

export function serializeJob<T extends { skills?: unknown }>(job: T): T & { skills: string[] } {
  return { ...job, skills: parseSkills(job.skills) };
}

const norm = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

const unpackJson = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

/**
 * The places a candidate would actually take a job: where they live plus
 * anywhere they nominated in onboarding.
 */
export interface CandidateArea {
  cities: string[];
  states: string[];
}

export function candidateArea(candidate: {
  currentCity?: string | null;
  currentState?: string | null;
  preferredLocations?: string | null;
}): CandidateArea {
  const cities = [
    ...unpackJson(candidate.preferredLocations),
    candidate.currentCity ?? '',
  ]
    .map(norm)
    .filter(Boolean);

  const states = [candidate.currentState ?? ''].map(norm).filter(Boolean);

  return { cities: [...new Set(cities)], states: [...new Set(states)] };
}

export function hasArea(area: CandidateArea): boolean {
  return area.cities.length > 0 || area.states.length > 0;
}

/**
 * Lower sorts first. Mirrors the location weighting in
 * /api/candidate/recommended-jobs so a job that ranks highly on the dashboard
 * does not sink on the jobs page.
 *
 * Ranking only ever reorders — no job is filtered out by proximity, because a
 * candidate willing to relocate still needs to see the rest of the market.
 */
export function locationRank(
  job: { city?: string | null; state?: string | null; location?: string | null; workMode?: string | null },
  area: CandidateArea
): number {
  const haystack = [job.city, job.state, job.location].map(norm).filter(Boolean).join(' | ');

  if (haystack && area.cities.some((c) => haystack.includes(c))) return 0;
  if (haystack && area.states.some((s) => haystack.includes(s))) return 1;
  // Remote is location-agnostic, so it outranks a job in an unrelated city.
  if (norm(job.workMode) === 'remote') return 2;
  return 3;
}

