import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Motojobs.in',
  description:
    'How Motojobs.in collects, uses, shares and protects your personal data, including resumes, and the rights you have over it.',
};

const SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    paragraphs: [
      'We collect only what the platform needs in order to match people with automobile-sector roles.',
    ],
    bullets: [
      'Account details: name, email address, password (stored only as a bcrypt hash), and optionally your phone number.',
      'Candidate profile: date of birth, qualification, experience, current and expected salary, notice period, brand experience, preferred locations, languages, driving licence and vehicle ownership.',
      'Uploads: your resume and profile photo.',
      'Employer profile: company name, business type, GST number, registered address and contact details.',
      'Usage data: pages viewed, jobs opened and applications submitted, along with your IP address for rate limiting and abuse prevention.',
    ],
  },
  {
    heading: 'Why we use it',
    bullets: [
      'To show you relevant roles and to show employers relevant candidates.',
      'To let you apply to jobs and to let employers review your application.',
      'To verify your email address and keep your account secure.',
      'To detect fraud, spam and job postings that charge candidates a fee.',
      'To send transactional email — verification codes, password resets and application updates.',
    ],
  },
  {
    heading: 'Who can see your profile',
    paragraphs: [
      'When you apply to a role, the employer who posted it can see your full profile and resume. Employers on a plan with resume-database access can search profiles that have been marked as open to opportunities.',
      'Your email address and phone number are never displayed publicly on the site, and are shared with an employer only once you apply to their role.',
    ],
  },
  {
    heading: 'Who we share data with',
    paragraphs: [
      'We do not sell your personal data. We share it only with service providers who help us run the platform — email delivery, hosting and, in future, payment processing — and only to the extent needed to perform that service.',
      'We may disclose data where required by law, court order or a lawful request from a government authority.',
    ],
  },
  {
    heading: 'How we protect it',
    bullets: [
      'Passwords are hashed with bcrypt and are never stored or logged in plain text.',
      'Sessions use signed JSON Web Tokens held in HTTP-only cookies, so they cannot be read by scripts in your browser.',
      'State-changing requests are protected against cross-site request forgery.',
      'One-time codes are stored only as hashes and expire after ten minutes.',
      'Sign-in, sign-up, code-sending and upload endpoints are rate limited.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'We keep your profile for as long as your account is open. If you delete your account, your profile and uploads are removed within 30 days, except where we must retain records to meet a legal or tax obligation.',
      'Applications already submitted remain visible to the employer who received them, since they form part of that employer’s hiring record.',
    ],
  },
  {
    heading: 'Your rights',
    bullets: [
      'Access and correct your data at any time from your dashboard.',
      'Download a copy of your profile and resume.',
      'Delete your account and the data attached to it.',
      'Withdraw an application, subject to the employer’s retained hiring record.',
      'Opt out of non-essential email. Transactional email tied to account security cannot be switched off while the account is open.',
    ],
  },
  {
    heading: 'Cookies',
    paragraphs: [
      'We use a small number of first-party cookies: one to keep you signed in, and one to protect forms against cross-site request forgery. We do not use third-party advertising cookies.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'The platform is not intended for anyone under 14, the minimum age for apprenticeship roles in the Indian automobile sector. We do not knowingly collect data from children below that age.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'If we change how we use your data in a material way, we will email the address on your account at least seven days before the change takes effect.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 August 2026"
      intro="This policy explains what data Motojobs.in collects, why we collect it, who can see it and what control you have over it. It applies to candidates and employers using the platform."
      sections={SECTIONS}
    />
  );
}
