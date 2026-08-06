'use client';

import { useState } from 'react';
import { Blocks } from 'lucide-react';
import TaxonomyManager from '@/components/admin/TaxonomyManager';

/** The four category lists the spec groups under one screen. */
const TABS = [
  {
    kind: 'JOB_CATEGORY',
    tab: 'Job categories',
    title: 'Job categories',
    subtitle: 'categories jobs are filed under',
    itemNoun: 'category',
    showBlurb: true,
  },
  {
    kind: 'INDUSTRY',
    tab: 'Industries',
    title: 'Industry categories',
    subtitle: 'business types employers pick from',
    itemNoun: 'industry',
  },
  {
    kind: 'EXPERIENCE_LEVEL',
    tab: 'Experience',
    title: 'Experience levels',
    subtitle: 'experience bands used on job posts',
    itemNoun: 'level',
  },
  {
    kind: 'EMPLOYMENT_TYPE',
    tab: 'Employment types',
    title: 'Employment types',
    subtitle: 'employment types used on job posts',
    itemNoun: 'type',
  },
] as const;

export default function CategoriesPage() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto scroll-none">
        {TABS.map((t, i) => (
          <button
            key={t.kind}
            onClick={() => setActive(i)}
            className={`press shrink-0 px-4 py-2.5 rounded-[12px] text-[12.5px] font-semibold border transition-all duration-300 ${
              i === active
                ? 'grad-brand text-white border-transparent shadow-brand'
                : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            {t.tab}
          </button>
        ))}
      </div>

      <TaxonomyManager
        // Remounts on tab change so the search box and inline edits reset.
        key={tab.kind}
        kind={tab.kind}
        title={tab.title}
        subtitle={tab.subtitle}
        itemNoun={tab.itemNoun}
        showBlurb={'showBlurb' in tab && tab.showBlurb}
        icon={Blocks}
      />
    </div>
  );
}
