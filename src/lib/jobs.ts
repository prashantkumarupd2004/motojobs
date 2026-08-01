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
