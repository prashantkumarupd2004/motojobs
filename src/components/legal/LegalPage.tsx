import Link from 'next/link';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-20">
      <h1 className="text-[34px] sm:text-[42px] font-extrabold text-ink tracking-[-0.04em] leading-[1.1]">
        {title}
      </h1>
      <p className="text-[13.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint mt-5">
        Last updated {updated}
      </p>
      <p className="text-ink-muted text-[16px] leading-[1.8] mt-6">{intro}</p>

      <div className="mt-12 space-y-10">
        {sections.map((section, i) => (
          <section key={section.heading}>
            <h2 className="text-[19px] font-bold text-ink tracking-[-0.025em]">
              <span className="text-ink-faint font-semibold mr-2.5">{i + 1}.</span>
              {section.heading}
            </h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="text-ink-muted text-[15px] leading-[1.8] mt-3.5">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 space-y-2.5">
                {section.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-ignite-500 mt-[9px] shrink-0" />
                    <span className="text-ink-muted text-[15px] leading-[1.75]">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="surface p-6 sm:p-7 mt-14">
        <h2 className="text-[15.5px] font-bold text-ink tracking-[-0.02em]">
          Questions about this document?
        </h2>
        <p className="text-ink-muted text-[14.5px] leading-[1.7] mt-2.5">
          Write to us at{' '}
          <a
            href="mailto:legal@motojobs.in"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            legal@motojobs.in
          </a>{' '}
          or use our{' '}
          <Link
            href="/contact"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            contact form
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
