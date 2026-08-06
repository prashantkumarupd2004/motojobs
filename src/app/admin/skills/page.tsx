'use client';

import { Sparkles } from 'lucide-react';
import TaxonomyManager from '@/components/admin/TaxonomyManager';

export default function SkillsPage() {
  return (
    <TaxonomyManager
      kind="SKILL"
      title="Skills"
      subtitle="skills candidates and jobs can be tagged with"
      itemNoun="skill"
      showGroup
      groupLabel="Category"
      icon={Sparkles}
    />
  );
}
