'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, MessageCircle, Send, Headphones,
  Shield, CheckCircle2, Lock, Users, Loader2, CheckCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';

/* ─── Constants ─────────────────────────────────────────────── */

const SUBJECTS = [
  'General Enquiry',
  'Employer Plans & Pricing',
  'Trouble with my Account',
  'Report a Job Posting',
  'Partnership Opportunity',
  'Technical Support',
];

const REACH_CARDS = [
  {
    icon: Phone,
    title: 'Call Us',
    line1: '+91 98765 43210',
    line2: 'Mon – Sat: 9:00 AM – 6:00 PM',
    link: 'tel:+919876543210',
  },
  {
    icon: Mail,
    title: 'Email Us',
    line1: 'support@motojobs.in',
    line2: 'We reply within 24 hours',
    link: 'mailto:support@motojobs.in',
  },
  {
    icon: MapPin,
    title: 'Office Address',
    line1: 'MotoJobs.in',
    line2: '123, Automotive Street, Sector 62,\nNoida, Uttar Pradesh – 201301, India',
    link: 'https://maps.google.com/?q=Sector+62+Noida+UP',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    line1: 'Chat with our support team',
    line2: 'Available on website',
    link: '#',
    highlight: true,
  },
];

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Trusted Platform',
    desc: 'Thousands of verified jobs from trusted employers',
  },
  {
    icon: CheckCircle2,
    title: 'Quick Response',
    desc: 'We respond to all queries within 24 hours',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    desc: 'Your information is safe and never shared',
  },
  {
    icon: Users,
    title: 'Customer First',
    desc: "We're here to help you at every step",
  },
];

const EMPTY = { name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' };

/* ─── Input component ────────────────────────────────────────── */
function FormInput({
  label, id, type = 'text', value, onChange, placeholder, required, icon: Icon,
}: {
  label: string; id: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; required?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#374151]">
        {label}{required && <span className="text-[#2563EB] ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-[52px] border border-[#E5E7EB] rounded-[12px] ${Icon ? 'pl-10' : 'px-4'} pr-4 text-[14px] text-[#0F172A] placeholder-[#9CA3AF] outline-none bg-white transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)]`}
        />
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm]     = useState(EMPTY);
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]     = useState('');
  const [error, setError]   = useState('');

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError('Please agree to our Privacy Policy and Terms.'); return; }
    setSending(true); setError('');
    try {
      const res  = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send your message');
      setSent(data.message || 'Message sent! We\'ll get back to you within 24 hours.');
      setForm(EMPTY); setAgreed(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send your message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#0F2D58', minHeight: 260 }}
      >
        <Image
          src="/hero-job.png" alt="Automotive workshop" fill
          className="object-cover object-center select-none"
          style={{ opacity: 0.22 }} priority
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg,rgba(10,29,60,0.97) 45%,rgba(15,45,88,0.68) 100%)' }}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 flex items-center justify-between gap-8 min-h-[260px]">
          {/* Left content */}
          <div className="max-w-xl">
            <h1 className="text-[40px] sm:text-[52px] font-bold text-white leading-[1.12] tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-[15px] text-[#93C5FD] leading-[1.7] max-w-md">
              We&apos;re here to help! Reach out to us for any queries, support
              or feedback. Our team will get back to you soon.
            </p>
          </div>

          {/* Right: Need Help card */}
          <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[20px] px-6 py-5 shrink-0 min-w-[280px]">
            <div className="w-12 h-12 rounded-full bg-[#2563EB]/30 border border-[#2563EB]/40 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[17px] font-bold text-white leading-tight mb-1">Need Help?</p>
              <p className="text-[13px] text-[#CBD5E1]">Our support team is available</p>
              <p className="text-[13px] font-semibold text-[#60A5FA] mt-0.5">
                Mon – Sat: 9:00 AM – 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAIN 2-COLUMN CONTENT
      ══════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        <div className="flex gap-7 items-start">

          {/* ── LEFT: Contact Form ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-[#E8EDF5] rounded-[20px] p-8 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">

              {sent ? (
                /* Success state */
                <div className="py-14 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h2 className="text-[22px] font-bold text-[#0F172A] mb-2">Message Sent!</h2>
                  <p className="text-[14.5px] text-[#64748B] max-w-sm mx-auto leading-[1.7]">{sent}</p>
                  <button
                    onClick={() => setSent('')}
                    className="mt-6 text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-[24px] font-bold text-[#0F172A] leading-tight mb-1">
                      Send Us a Message
                    </h2>
                    <p className="text-[14px] text-[#64748B]">
                      Fill out the form below and we&apos;ll get back to you.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-5 bg-[#FEF2F2] border border-[#FCA5A5]/50 text-[#DC2626] rounded-[12px] px-4 py-3 text-[13.5px] font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormInput
                        label="Full Name" id="name" value={form.name}
                        onChange={set('name')} placeholder="Enter your full name"
                        required icon={({ className }: { className?: string }) => (
                          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                      />
                      <FormInput
                        label="Email Address" id="email" type="email" value={form.email}
                        onChange={set('email')} placeholder="Enter your email"
                        required icon={Mail}
                      />
                    </div>

                    {/* Row 2: Phone + Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormInput
                        label="Phone Number (Optional)" id="phone" type="tel" value={form.phone}
                        onChange={set('phone')} placeholder="Enter your phone number"
                        icon={Phone}
                      />
                      {/* Subject dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="subject" className="text-[13px] font-semibold text-[#374151]">
                          Subject<span className="text-[#2563EB] ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="subject" value={form.subject} onChange={set('subject')}
                            className="w-full h-[52px] border border-[#E5E7EB] rounded-[12px] px-4 pr-10 text-[14px] text-[#0F172A] bg-white appearance-none outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)] cursor-pointer"
                          >
                            <option value="" disabled>Select a subject</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Message */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="message" className="text-[13px] font-semibold text-[#374151]">
                        Message<span className="text-[#2563EB] ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-4 w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <textarea
                          id="message" value={form.message} onChange={set('message')}
                          rows={6} maxLength={4000}
                          placeholder="Type your message here..."
                          className="w-full border border-[#E5E7EB] rounded-[12px] pl-10 pr-4 pt-3.5 pb-3 text-[14px] text-[#0F172A] placeholder-[#9CA3AF] outline-none bg-white resize-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)] leading-[1.7]"
                          style={{ minHeight: 150 }}
                        />
                      </div>
                    </div>

                    {/* Agree checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <span
                        className={`w-[16px] h-[16px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150 ${agreed ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#CBD5E1] hover:border-[#2563EB]'}`}
                        onClick={() => setAgreed(a => !a)}
                      >
                        {agreed && (
                          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-[13px] text-[#64748B]">
                        I agree to the{' '}
                        <Link href="/privacy" className="text-[#2563EB] hover:underline font-medium">Privacy Policy</Link>
                        {' '}and{' '}
                        <Link href="/terms" className="text-[#2563EB] hover:underline font-medium">Terms & Conditions</Link>
                      </span>
                    </label>

                    {/* Submit button */}
                    <button
                      type="submit" disabled={sending}
                      className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-[15px] font-semibold px-7 rounded-[14px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(37,99,235,0.30)]"
                      style={{ height: 52 }}
                    >
                      {sending ? (
                        <><Loader2 className="w-[18px] h-[18px] animate-spin" />Sending…</>
                      ) : (
                        <><Send className="w-[16px] h-[16px]" />Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT: Reach Cards ── */}
          <aside className="hidden lg:block w-[340px] shrink-0">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-5">Other Ways to Reach Us</h2>
            <div className="space-y-3">
              {REACH_CARDS.map(({ icon: Icon, title, line1, line2, link, highlight }) => (
                <a
                  key={title} href={link}
                  target={link.startsWith('http') ? '_blank' : undefined}
                  rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block bg-white border border-[#E8EDF5] rounded-[16px] p-5 flex items-start gap-4 hover:shadow-[0_6px_24px_rgba(15,23,42,0.10)] hover:-translate-y-[2px] transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:bg-[#DBEAFE] transition-colors">
                    <Icon className="w-[18px] h-[18px] text-[#2563EB]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A] mb-0.5">{title}</p>
                    <p className="text-[13px] text-[#475569] leading-snug">{line1}</p>
                    <p className={`text-[12.5px] mt-0.5 leading-snug whitespace-pre-line ${highlight ? 'text-[#2563EB] font-semibold' : 'text-[#94A3B8]'}`}>
                      {line2}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>

        {/* Mobile reach cards */}
        <div className="lg:hidden mt-8">
          <h2 className="text-[18px] font-bold text-[#0F172A] mb-4">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REACH_CARDS.map(({ icon: Icon, title, line1, line2, link, highlight }) => (
              <a
                key={title} href={link}
                className="block bg-white border border-[#E8EDF5] rounded-[16px] p-4 flex items-start gap-3 hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A] mb-0.5">{title}</p>
                  <p className="text-[12px] text-[#475569]">{line1}</p>
                  <p className={`text-[11.5px] mt-0.5 whitespace-pre-line ${highlight ? 'text-[#2563EB] font-semibold' : 'text-[#94A3B8]'}`}>{line2}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TRUST FEATURE STRIP
      ══════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pb-12">
        <div className="bg-white border border-[#E8EDF5] rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#F1F5F9]">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-6 hover:bg-[#FAFBFF] transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:bg-[#DBEAFE] transition-colors">
                  <Icon className="w-[18px] h-[18px] text-[#2563EB]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#2563EB] leading-tight mb-0.5">{title}</p>
                  <p className="text-[12px] text-[#64748B] leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
