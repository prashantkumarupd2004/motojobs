/**
 * Seed content for the `blogs` table. The public pages read from the database via
 * `blog-db.ts`; these posts are inserted once so a fresh install does not render
 * an empty blog. Kept out of `blog-types.ts` so the client bundle never carries
 * the full article bodies.
 */

import type { BlogPost } from '@/lib/blog-types';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'service-advisor-interview-questions',
    title: '12 Service Advisor interview questions, and how to answer them',
    excerpt:
      'What dealership service managers actually listen for when they ask about upselling, customer escalations and workshop load.',
    category: 'Interview Prep',
    author: 'Motojobs Editorial',
    publishedAt: '2026-07-24',
    readMinutes: 8,
    body: [
      'A Service Advisor sits between an anxious customer and a workshop running at capacity. Interviews for the role test that balance more than they test technical depth — you are being assessed on how you behave when a job card slips and the customer is standing at the counter.',
      '## Questions about handling customers',
      'Expect a scenario: a customer was promised delivery by 4 PM, the part has not arrived, and they are already unhappy about a previous visit. The interviewer wants to hear that you inform early rather than late, offer a concrete revised time instead of a vague apology, and escalate to the service manager before the customer asks to.',
      'Avoid answers that end with "I would explain the situation". Explain what you would offer — a courtesy vehicle, a partial job completion, a call from the technician. Specificity signals you have done this before.',
      '## Questions about revenue',
      'Service advisors carry a value-per-vehicle target, so you will be asked about upselling. The strongest answers separate genuine recommendations from padding: describe how you would show a customer the worn brake pad rather than simply telling them it needs replacing. Managers know that trust-based selling produces repeat business, and they are wary of advisors who inflate a bill once and lose the customer.',
      'Have your numbers ready. If you handled 12 vehicles a day at an average bill of ₹6,500, say so. Vague claims about being "good with customers" do not survive follow-up questions.',
      '## Questions about systems and process',
      'You will be asked which DMS you have used, how you raise a job card, and how you track warranty claims. Name the actual software. If you have only worked on paper job cards, say that plainly and describe how quickly you picked up other systems — dealerships train on their own DMS anyway.',
      '## What to ask them',
      'Ask about daily vehicle intake, the number of advisors on the floor and how the workshop handles overflow. It tells the interviewer you are thinking about throughput, and it tells you whether the role is staffed realistically.',
    ],
  },
  {
    slug: 'ev-technician-skills-2026',
    title: 'The EV skills Indian workshops are actually hiring for in 2026',
    excerpt:
      'High-voltage safety certification is now the entry ticket. Here is what else separates a shortlisted EV technician from a rejected one.',
    category: 'Career Growth',
    author: 'Motojobs Editorial',
    publishedAt: '2026-07-11',
    readMinutes: 7,
    body: [
      'Electric two- and three-wheelers have pushed EV servicing out of metro pilot workshops and into tier-two cities. The hiring pattern has shifted with it: workshops no longer want someone who has merely attended an EV awareness session.',
      '## High-voltage safety is non-negotiable',
      'Any battery pack above 60V requires documented safety training before you are allowed near it. Employers ask for the certificate by name, and an ITI diploma alone does not cover it. If you do not have one, a short certified course is the single highest-return investment in your profile right now.',
      '## Diagnostics has replaced disassembly',
      'On an internal combustion engine, experience often meant knowing the feel of a component. On an EV, the fault is usually in the battery management system, a motor controller or a wiring harness, and it is read through software. Familiarity with CAN bus diagnostics and reading fault codes now matters more than mechanical dexterity.',
      '## Battery thermal management',
      'Indian summers put battery packs under thermal stress that European service manuals do not fully anticipate. Technicians who understand coolant loops, thermal derating and how a pack behaves at 45°C ambient are genuinely scarce, and workshops pay for it.',
      '## What carries over from ICE work',
      'Suspension, brakes, steering and body work are unchanged. Regenerative braking alters pad wear patterns, but the fundamentals hold. If you are moving across from ICE work, lead with your diagnostic discipline rather than apologising for the lack of EV years — most workshops are training people internally because there is no other option.',
      '## How to present it on your profile',
      'List the certification, the battery chemistries you have worked with, and the diagnostic tools by name. "EV experience" as a bare phrase tells a recruiter nothing and is usually skipped over.',
    ],
  },
  {
    slug: 'automobile-resume-mistakes',
    title: 'Seven resume mistakes that cost automobile candidates interviews',
    excerpt:
      'Recruiters at dealerships and OEMs scan a resume in under thirty seconds. These are the errors that end it early.',
    category: 'Resume Tips',
    author: 'Motojobs Editorial',
    publishedAt: '2026-06-28',
    readMinutes: 6,
    body: [
      'Automobile hiring runs on volume. A dealer group filling fifteen positions across four outlets gives each resume a first pass measured in seconds. These are the mistakes that end that pass badly.',
      '## Leaving out the brands you have worked on',
      'This is the most common and most expensive omission. A recruiter hiring for a Maruti workshop searches for Maruti experience. If your resume says "worked at an authorised service centre" without naming the brand, you do not appear in the search at all.',
      '## Listing duties instead of numbers',
      '"Handled customer vehicles" describes a job title, not performance. "Serviced 14 vehicles a day with a 92% first-time-fix rate" describes a candidate. Numbers survive scanning; adjectives do not.',
      '## Hiding your certifications',
      'ITI trade, diploma stream, OEM training modules and high-voltage safety certification belong near the top, not in a footer. For technician roles these are frequently the first filter applied.',
      '## Being vague about notice period',
      'Dealerships hire to fill a gap that already exists. "Immediate joiner" or "15 days" moves you up the pile. Silence on the point reads as uncertainty.',
      '## No location clarity',
      'State your current city and the locations you would move to. Recruiters filter by location before they read anything else, and an unstated preference is treated as unwilling to relocate.',
      '## A photo where the details should be',
      'A profile photo is fine on the platform. On the resume, the space is better spent on your current designation, total experience and brand exposure.',
      '## Sending the same resume everywhere',
      'A Sales Consultant resume and a Service Advisor resume should read differently even for the same person. Lead with the experience that matches the posting, and move the rest down.',
    ],
  },
  {
    slug: 'dealership-hiring-guide-employers',
    title: 'How dealerships can cut technician hiring time in half',
    excerpt:
      'Job posts that name the brand, the shift pattern and an honest salary band fill three times faster. A practical guide for service managers.',
    category: 'For Employers',
    author: 'Motojobs Editorial',
    publishedAt: '2026-06-15',
    readMinutes: 7,
    body: [
      'Technician vacancies at Indian dealerships sit open for weeks, and the cause is usually the posting rather than the labour market. A few specific changes consistently shorten time-to-fill.',
      '## Name the brand in the title',
      '"Automobile Technician" competes with every workshop in the city. "Maruti Suzuki Technician — Wagon R & Baleno" reaches the people who already know the platform and can be productive in week one.',
      '## Publish a salary band',
      'Posts with a stated range attract materially more applications than posts saying "as per industry standards". Candidates read the latter as below market, and the ones who do apply spend the first interview negotiating rather than demonstrating fit.',
      '## Be explicit about the shift',
      'Workshop timings, whether Sundays are working, and how overtime is paid are the three questions that end otherwise successful conversations at offer stage. Answering them in the posting removes the candidates who would have declined anyway, which is a saving, not a loss.',
      '## Separate must-have from nice-to-have',
      'Requiring five years of experience for a role a two-year technician could do well shrinks the pool for no benefit. List the certifications that are genuinely mandatory — high-voltage safety for EV work, for instance — and mark the rest as preferred.',
      '## Respond within 48 hours',
      'Skilled technicians are typically in three processes at once. The workshop that responds first frequently wins, regardless of which offered more. Reviewing applications daily beats a weekly batch every time.',
      '## Keep the company profile current',
      'Candidates check who you are before they apply. Outlets, brands handled, team size and a few lines about how the workshop runs measurably raise application rates on the same job post.',
    ],
  },
];
