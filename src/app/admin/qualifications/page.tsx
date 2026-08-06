'use client';

import { GraduationCap } from 'lucide-react';
import TaxonomyManager from '@/components/admin/TaxonomyManager';

export default function QualificationsPage() {
  return (
    <TaxonomyManager
      kind="QUALIFICATION"
      title="Qualifications"
      subtitle="qualifications candidates can select"
      itemNoun="qualification"
      icon={GraduationCap}
    />
  );
}
