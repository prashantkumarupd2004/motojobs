import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "About Us — MotoJobs.in | India's Automotive Job Portal",
  description:
    "Learn about MotoJobs.in — India's dedicated job portal connecting automotive talent with dealerships, workshops, OEMs, and EV companies across the country.",
  alternates: { canonical: '/about' },
};

const STATS = [
  { value: '10,000+', label: 'Active Job Listings' },
  { value: '500+',    label: 'Verified Employers' },
  { value: '50,000+', label: 'Registered Job Seekers' },
  { value: '7 Days',  label: 'Average Time-to-Hire' },
];

const VALUES = [
  {
    icon: '🎯',
    title: 'Niche Focused',
    desc: "We serve only the automotive sector — zero noise from unrelated industries. Every feature is built specifically for dealerships, workshops, OEMs, and EV companies.",
  },
  {
    icon: '🔒',
    title: 'Verified Employers',
    desc: 'Every company is manually reviewed before they can post jobs. Job seekers can trust that every listing comes from a legitimate employer.',
  },
  {
    icon: '⚡',
    title: 'Fast Hiring',
    desc: 'Our smart matching engine connects the right candidates with the right roles faster — our average time-to-hire is just 7 days.',
  },
  {
    icon: '📱',
    title: 'Mobile First',
    desc: 'Apply on the go. Our platform is fully responsive so automotive professionals can find and apply for jobs from any device, anytime.',
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F2D58 0%, #1E40AF 100%)', minHeight: 320 }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #60A5FA 0%, transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-20 text-center">
          <span className="inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[#93C5FD] mb-4">
            Our Story
          </span>
          <h1 className="text-[38px] sm:text-[52px] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            India&apos;s Automotive<br />
            <span style={{ background: 'linear-gradient(90deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Job Portal
            </span>
          </h1>
          <p className="text-[16px] text-[#BFDBFE] max-w-xl mx-auto leading-relaxed">
            MotoJobs.in was built to solve one problem: finding the right automotive talent fast.
            We connect skilled professionals with the dealerships, workshops, OEMs, and EV companies that need them.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 -mt-12 pb-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-[20px] border border-[#E8EEF8] shadow-[0_8px_32px_rgba(15,23,42,0.10)] grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F1F5F9]">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <span className="text-[30px] font-extrabold text-[#1E40AF] tracking-tight leading-none">{value}</span>
                <span className="text-[13px] text-[#64748B] mt-1.5 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2563EB] mb-2">Our Mission</p>
            <h2 className="text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight mb-5">
              Powering careers across India&apos;s automobile industry
            </h2>
            <p className="text-[15px] text-[#475569] leading-relaxed mb-4">
              The automotive industry is the backbone of India&apos;s manufacturing economy — yet finding
              skilled talent remained fragmented and slow. MotoJobs.in was founded to change that.
            </p>
            <p className="text-[15px] text-[#475569] leading-relaxed mb-6">
              We built a platform exclusively for the auto sector — where every feature, every filter,
              and every job listing is tailored to the unique needs of dealerships, service centres,
              OEMs, and the fast-growing EV ecosystem.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold text-[14px] px-6 py-3 rounded-[12px] hover:bg-[#1D4ED8] transition-colors"
            >
              Browse Jobs →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#F8FAFC] border border-[#E8EEF8] rounded-[16px] p-5 hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all duration-200"
              >
                <span className="text-[28px] block mb-3">{icon}</span>
                <h3 className="text-[14px] font-bold text-[#0F172A] mb-1">{title}</h3>
                <p className="text-[12.5px] text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg,#EEF4FF 0%,#E8F0FE 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[30px] font-bold text-[#0F172A] mb-3">Ready to find your next role?</h2>
          <p className="text-[15px] text-[#64748B] mb-8">
            Join thousands of automotive professionals who found their dream job on MotoJobs.in.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register?role=candidate"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold text-[14.5px] px-8 py-3.5 rounded-[12px] hover:bg-[#1D4ED8] transition-colors shadow-[0_4px_16px_rgba(37,99,235,0.3)]"
            >
              Create Free Profile
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-[#BFDBFE] text-[#2563EB] font-semibold text-[14.5px] px-8 py-3.5 rounded-[12px] bg-white hover:bg-[#EFF6FF] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
