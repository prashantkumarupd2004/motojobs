'use client';
import { useEffect, useState } from 'react';
import { baselineTaxonomy, type TaxonomyKind, type TaxonomyOption } from '@/lib/taxonomy-baseline';

/**
 * The admin-managed list for `kind`, fetched from /api/taxonomy.
 *
 * Starts on the shipped baseline rather than an empty array so filters and
 * dropdowns render immediately and stay usable if the request fails — the list
 * only ever gains admin additions, it never blanks out.
 */
export function useTaxonomy(kind: TaxonomyKind): TaxonomyOption[] {
  const [items, setItems] = useState<TaxonomyOption[]>(() => baselineTaxonomy(kind));

  useEffect(() => {
    let live = true;
    fetch(`/api/taxonomy?kind=${kind}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (live && Array.isArray(data.items) && data.items.length) setItems(data.items);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [kind]);

  return items;
}
