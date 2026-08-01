import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Motojobs.in',
  description:
    'The terms governing use of Motojobs.in by candidates and employers, including account rules, job posting standards and liability.',
};

const SECTIONS: LegalSection[] = [
  {
    heading: 'Acceptance of these terms',
    paragraphs: [
      'By creating an account, posting a job or applying to a role on Motojobs.in, you agree to these terms. If you do not agree, please do not use the platform.',
      'We may update these terms as the platform evolves. Material changes will be notified by email to the address on your account at least seven days before they take effect.',
    ],
  },
  {
    heading: 'Eligibility',
    paragraphs: [
      'You must be at least 14 years old to create a candidate account, reflecting the minimum age for apprenticeship roles in the Indian automobile sector. Employers must be a registered business or a duly authorised representative of one.',
    ],
  },
  {
    heading: 'Your account',
    bullets: [
      'You are responsible for the accuracy of the information you provide, including qualifications, experience and brand exposure.',
      'Keep your password confidential. Notify us immediately if you suspect unauthorised access.',
      'One person, one candidate account. Duplicate or impersonating accounts may be removed without notice.',
      'Email verification is mandatory. Unverified accounts cannot apply to roles or post jobs.',
    ],
  },
  {
    heading: 'Rules for candidates',
    bullets: [
      'Do not misrepresent your qualifications, certifications, current employer or salary.',
      'Only upload documents you have the right to share. Do not upload another person’s resume or identity documents.',
      'Do not use the platform to solicit business, sell services or spread unrelated content.',
    ],
  },
  {
    heading: 'Rules for employers',
    bullets: [
      'Post only genuine, currently open roles at your own organisation or one you are authorised to recruit for.',
      'Never charge candidates any fee for a job, training, deposit, uniform or tool kit. Any such posting will be removed and the account suspended.',
      'Job descriptions must state the role, location, employment type and an honest salary range where given.',
      'Candidate data accessed through the platform may be used only to evaluate applicants for the posted role, and must not be resold or shared with third parties.',
      'Postings must comply with Indian equal-opportunity law. Discriminatory requirements based on religion, caste, gender, marital status or disability are not permitted.',
    ],
  },
  {
    heading: 'Job listings and moderation',
    paragraphs: [
      'Job posts are reviewed before they appear publicly. We may reject, edit or remove any listing that breaches these terms, appears fraudulent, or misrepresents the role — at our discretion and without liability to the employer.',
      'Approval of a listing is not an endorsement of the employer, and we do not independently verify every claim made in a posting.',
    ],
  },
  {
    heading: 'Fees and payment',
    paragraphs: [
      'Candidate accounts are free. Employer plans are billed as described on our pricing page, in advance and in Indian rupees, inclusive of applicable GST unless stated otherwise.',
      'Plan changes take effect from the next billing cycle. Fees already paid for a completed billing period are non-refundable except where required by law.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'The Motojobs.in name, logo, design and software are our property. Content you upload remains yours, but you grant us a licence to host, display and transmit it for the purpose of operating the platform — for example, showing your resume to an employer whose role you applied to.',
    ],
  },
  {
    heading: 'Our role and limits of liability',
    paragraphs: [
      'Motojobs.in is a platform that connects candidates and employers. We are not a party to any employment relationship, do not guarantee any job or hire, and are not an employment agency under applicable labour law.',
      'To the maximum extent permitted by law, we are not liable for indirect or consequential loss arising from your use of the platform, including lost earnings or lost hiring opportunities. Our total liability is limited to the fees you paid us in the preceding three months.',
    ],
  },
  {
    heading: 'Suspension and termination',
    paragraphs: [
      'You may close your account at any time from your dashboard. We may suspend or terminate an account that breaches these terms, presents a security or fraud risk, or is used to charge candidates a fee.',
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Pune, Maharashtra.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="1 August 2026"
      intro="These terms set out the rules for using Motojobs.in — India's dedicated hiring platform for the automobile sector. They apply to everyone: candidates, dealerships, workshops, OEMs and EV companies alike."
      sections={SECTIONS}
    />
  );
}
