import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { BILLING_ENABLED } from '@/lib/subscription';

export const metadata: Metadata = {
  title: 'Pricing for Employers — Motojobs.in',
  description:
    'Simple hiring plans for dealerships, workshops, OEMs and EV companies. Free for job seekers, always. Pay only for the roles you post.',
};

type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '₹0',
    cadence: 'forever',
    blurb: 'For single-outlet workshops testing the waters.',
    features: [
      '1 active job post',
      'Up to 30 applications per role',
      'Company profile page',
      'Email support',
    ],
    cta: 'Start free',
  },
  {
    name: 'Growth',
    price: '₹4,999',
    cadence: 'per month',
    blurb: 'For dealerships hiring across multiple outlets.',
    features: [
      '10 active job posts',
      'Unlimited applications',
      'Resume database access',
      'ATS pipeline board',
      'Verified company badge',
      'Priority email & phone support',
    ],
    cta: 'Choose Growth',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'talk to us',
    blurb: 'For OEMs and dealer groups hiring at scale.',
    features: [
      'Unlimited job posts',
      'Bulk hiring campaigns',
      'AI candidate screening',
      'Dedicated account manager',
      'Custom onboarding & training',
    ],
    cta: 'Contact sales',
  },
];

const FAQS: [string, string][] = [
  ...(BILLING_ENABLED
    ? []
    : ([
        [
          'What does the free early access include?',
          'Everything. While we build our employer base, every plan is free — unlimited job posts, full resume database access and the ATS board, with no card required. We will give plenty of notice before any charges begin.',
        ],
      ] as [string, string][])),
  [
    'Is Motojobs really free for job seekers?',
    'Yes. Candidates never pay to create a profile, upload a resume or apply to any role. Our revenue comes entirely from employer plans.',
  ],
  [
    'Can I change plans later?',
    'You can upgrade or downgrade at any time. Changes take effect from your next billing cycle, and unused job slots carry over for 30 days.',
  ],
  [
    'Do you charge per hire?',
    'No. Plans are flat monthly fees regardless of how many people you hire. There is no success fee and no commission.',
  ],
  [
    'What counts as an active job post?',
    'Any role currently visible to candidates. Closing or pausing a role frees the slot immediately for a new posting.',
  ],
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 bg-ignite-50 border border-ignite-500/20 text-ignite-600 text-[12.5px] font-bold uppercase tracking-[0.12em] px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          For employers
        </span>
        <h1 className="text-[34px] sm:text-[46px] font-extrabold text-ink tracking-[-0.04em] leading-[1.1] mt-6">
          Hiring plans built for the auto trade
        </h1>
        <p className="text-ink-muted text-[16px] leading-[1.75] mt-5">
          Reach technicians, service advisors and sales consultants who actually work in
          the industry. Free for job seekers, always.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`surface sheen p-8 flex flex-col relative ${
              plan.featured ? 'ring-2 ring-brand-600 lg:-mt-4 lg:mb-4' : ''
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 grad-brand text-white text-[11.5px] font-bold uppercase tracking-[0.12em] px-3.5 py-1.5 rounded-full shadow-brand">
                Most popular
              </span>
            )}

            <h2 className="text-[19px] font-bold text-ink tracking-[-0.025em]">
              {plan.name}
            </h2>
            <p className="text-ink-muted text-[14px] leading-[1.65] mt-2 min-h-[42px]">
              {plan.blurb}
            </p>

            <div className="flex items-baseline gap-2 mt-6">
              <span className="text-[36px] font-extrabold text-ink tracking-[-0.04em]">
                {BILLING_ENABLED ? plan.price : '₹0'}
              </span>
              <span className="text-[13.5px] font-medium text-ink-faint">
                {BILLING_ENABLED ? plan.cadence : 'free while in early access'}
              </span>
            </div>
            {!BILLING_ENABLED && plan.price !== '₹0' && (
              <p className="text-[12.5px] text-ink-faint mt-2">
                Normally {plan.price} {plan.cadence}
              </p>
            )}

            <ul className="space-y-3.5 mt-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-positive-soft flex items-center justify-center mt-px">
                    <Check className="w-3 h-3 text-positive" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] text-ink-soft leading-[1.6]">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.name === 'Enterprise' ? '/contact' : '/register?role=recruiter'}
              className={`mt-9 w-full text-center font-semibold text-[15px] rounded-[14px] py-3.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 ${
                plan.featured
                  ? 'grad-brand text-white shadow-brand hover:shadow-e4'
                  : 'bg-white text-ink border border-line hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-20">
        <h2 className="text-[26px] font-extrabold text-ink tracking-[-0.035em] text-center">
          Questions, answered
        </h2>
        <div className="space-y-4 mt-9">
          {FAQS.map(([q, a]) => (
            <div key={q} className="surface p-6 sm:p-7">
              <h3 className="text-[15.5px] font-bold text-ink tracking-[-0.02em]">{q}</h3>
              <p className="text-ink-muted text-[14.5px] leading-[1.75] mt-2.5">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface sheen p-9 sm:p-12 mt-16 text-center">
        <h2 className="text-[24px] sm:text-[28px] font-extrabold text-ink tracking-[-0.035em]">
          Not sure which plan fits?
        </h2>
        <p className="text-ink-muted text-[15.5px] leading-[1.7] mt-3.5 max-w-lg mx-auto">
          Tell us how many outlets you run and what roles you are filling. We will point
          you at the right plan — no sales pressure.
        </p>
        <Link
          href="/contact"
          className="inline-block mt-7 grad-ignite text-white font-semibold text-[15px] rounded-[14px] px-7 py-3.5 shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.32)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
        >
          Talk to our team
        </Link>
      </div>
    </div>
  );
}
