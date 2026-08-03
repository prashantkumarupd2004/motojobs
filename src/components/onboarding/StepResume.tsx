'use client';

import { FileText } from 'lucide-react';
import { MAX_RESUME_BYTES } from '@/lib/automotive';
import { Field, FileUpload } from '@/components/form';
import SectionTitle from './SectionTitle';
import type { StepProps } from './wizard-state';

export default function StepResume({ state, patch, errors }: StepProps) {
  return (
    <section className="space-y-6 animate-fade-in">
      <SectionTitle icon={FileText} title="Upload your resume" />

      <p className="text-[14px] text-ink-muted leading-[1.7] -mt-1">
        A resume roughly doubles your chances of a callback. You can add one later from
        your profile if you do not have it handy.
      </p>

      <Field label="Resume" error={errors.resumeUrl} hint="PDF, DOC or DOCX. Up to 5MB.">
        <FileUpload
          accept=".pdf,.doc,.docx"
          maxBytes={MAX_RESUME_BYTES}
          value={state.resume?.url}
          fileName={state.resume?.name}
          onChange={(resume) => patch({ resume })}
          label="Drag and drop your resume"
          hint="or click to browse"
        />
      </Field>
    </section>
  );
}
