/**
 * Canonical origin for crawler-facing URLs (canonicals, sitemap, robots).
 *
 * Deliberately not derived from NEXT_PUBLIC_APP_URL: that is set to the apex
 * `https://motojobs.in`, which 301s to www. A canonical or sitemap entry
 * pointing at a redirect wastes crawl budget and splits ranking signals, so
 * these URLs must name the destination the load balancer actually serves.
 */
export const SITE_URL = "https://www.motojobs.in";
