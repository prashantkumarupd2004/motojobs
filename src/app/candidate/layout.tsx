'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bookmark,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/layout/NotificationBell';

const NAV_ITEMS = [
  { href: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/candidate/profile', icon: User, label: 'My Profile' },
  { href: '/jobs', icon: Search, label: 'Find Jobs' },
  { href: '/candidate/applied-jobs', icon: Briefcase, label: 'My Applications' },
  { href: '/candidate/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  { href: '/candidate/interviews', icon: CalendarCheck, label: 'Interviews' },
  { href: '/candidate/documents', icon: FileText, label: 'Documents' },
  { href: '/candidate/settings', icon: Settings, label: 'Settings' },
];

/* Bottom-nav items for mobile — 5 most important actions */
const BOTTOM_NAV = [
  { href: '/candidate/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/jobs', icon: Search, label: 'Jobs' },
  { href: '/candidate/applied-jobs', icon: Briefcase, label: 'Applied' },
  { href: '/candidate/profile', icon: User, label: 'Profile' },
  { href: '/candidate/settings', icon: MoreHorizontal, label: 'More' },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const [account, setAccount] = useState<{
    name: string;
    email: string;
    image: string | null;
    profileScore?: number;
  } | null>(null);

  const onboarding = pathname === '/candidate/onboarding';

  useEffect(() => {
    if (onboarding) return;
    let cancelled = false;
    fetch('/api/candidate/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.data) return;
        if (!data.data.isProfileComplete) router.replace('/candidate/onboarding');
        if (data.data.account) {
          setAccount({
            name: data.data.account.name ?? '',
            email: data.data.account.email ?? '',
            image: data.data.account.profileImage ?? null,
            profileScore: data.data.profileScore ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [onboarding, router]);

  if (onboarding) return <>{children}</>;

  const initial = account?.name?.[0]?.toUpperCase() ?? 'U';
  const score = account?.profileScore ?? 0;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
          onLogout={logout}
          score={score}
          account={account}
        />
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#0B1220]/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 shadow-[0_0_40px_rgba(0,0,0,0.18)] animate-slide-in">
            <Sidebar
              mobile
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={logout}
              score={score}
              account={account}
            />
          </div>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Sticky header ──────────────────────────────────────── */}
        <header className="h-[72px] lg:h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-7 shrink-0 shadow-[0_1px_0_#E5E7EB]">
          {/* Left: hamburger (mobile) + greeting */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden text-[#64748B] hover:text-[#1D4ED8] p-2 -ml-1.5 rounded-xl hover:bg-[#EFF6FF] transition-all"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[15px] lg:text-[16px] font-bold text-[#0F172A] truncate leading-tight">
                Hello, {account?.name?.split(' ')[0] ?? 'there'} 👋
              </p>
              <p className="hidden sm:block text-[12px] text-[#64748B] truncate">
                Welcome back! Let&apos;s find your dream job
              </p>
            </div>
          </div>

          {/* Center: search bar (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-[420px] mx-4 lg:mx-8">
            <Link
              href="/jobs"
              className="search-glow flex items-center gap-2.5 w-full h-10 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13.5px] text-[#94A3B8] hover:border-[#93C5FD] transition-all duration-200 group"
            >
              <Search className="w-4 h-4 shrink-0 text-[#94A3B8] group-hover:text-[#1D4ED8] transition-colors" />
              <span className="flex-1 truncate">Search jobs, skills or companies…</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#E2E8F0] rounded-md text-[10px] font-semibold text-[#94A3B8] tracking-wide shrink-0">
                ⌘ K
              </kbd>
            </Link>
          </div>

          {/* Right: notification + settings + avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NotificationBell />
            <Link
              href="/candidate/settings"
              aria-label="Settings"
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#1D4ED8] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all duration-200"
            >
              <Settings className="w-[17px] h-[17px]" />
            </Link>
            <Link href="/candidate/profile" aria-label="My profile">
              {account?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.image}
                  alt=""
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl object-cover border-2 border-[#BFDBFE] shadow-sm"
                />
              ) : (
                <span className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl grad-brand flex items-center justify-center text-white text-[13px] font-bold shadow-sm border border-[#1D4ED8]/20">
                  {initial}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* ── Scrollable page content ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-7 pb-20 lg:pb-7">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ──────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E7EB] flex items-stretch safe-area-inset-bottom shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/candidate/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-[#1D4ED8]' : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-2'}`} />
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 w-5 h-0.5 bg-[#1D4ED8] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SIDEBAR
   ════════════════════════════════════════════════════════════ */

function Sidebar({
  mobile = false,
  pathname,
  onNavigate,
  onLogout,
  score,
  account,
}: {
  mobile?: boolean;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
  score: number;
  account: { name: string; email: string; image: string | null } | null;
}) {
  return (
    <aside className="flex flex-col h-full w-[264px] bg-white border-r border-[#E5E7EB]">

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-[72px] lg:h-20 px-5 border-b border-[#F1F5F9] shrink-0">
        <Link href="/" className="flex items-center gap-3">
          {/* Gradient spark icon */}
          <div className="relative w-9 h-9 rounded-[11px] grad-brand flex items-center justify-center shadow-[0_4px_12px_rgba(15,76,129,0.28)] shrink-0">
            <Gauge className="w-[18px] h-[18px] text-white" strokeWidth={2.3} />
          </div>
          {/* Brand name */}
          <div className="leading-none">
            <span className="block text-[16px] font-extrabold tracking-[-0.035em] text-[#0F172A]">
              <span className="text-[#1D4ED8]">Moto</span>Jobs.in
            </span>
            <span className="block text-[9px] font-semibold tracking-[0.18em] text-[#94A3B8] uppercase mt-[3px]">
              Your Drive. Our Opportunity.
            </span>
          </div>
        </Link>
        {mobile && (
          <button
            onClick={onNavigate}
            aria-label="Close menu"
            className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scroll-slim">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] transition-all duration-200 ${
                active
                  ? 'nav-active font-semibold'
                  : 'text-[#64748B] hover:text-[#1D4ED8] hover:bg-[#EFF6FF]'
              }`}
            >
              <Icon
                className="w-[18px] h-[18px] shrink-0"
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="text-[13.5px]">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* ── Profile completion card ──────────────────────────────── */}
      <div className="px-3 pb-3 shrink-0">
        <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] p-4 shadow-[0_4px_20px_rgba(29,78,216,0.35)]">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/[0.07] pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.05] pointer-events-none" />

          <div className="relative z-10">
            {/* Icon + label */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-white/20 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[13px] font-bold text-white leading-tight">
                Complete Your Profile
              </span>
            </div>

            <p className="text-[11.5px] text-blue-200 leading-[1.5] mb-3">
              {score >= 100
                ? 'Your profile is complete! Recruiters can find you now.'
                : 'Increase your chances of getting hired. Complete your profile.'}
            </p>

            {/* Progress bar */}
            <div className="mb-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-semibold text-blue-200">
                  {score >= 100 ? '100% Completed' : `${score}% Completed`}
                </span>
                {score >= 100 && (
                  <span className="text-[10px] font-bold text-[#86EFAC] bg-white/10 px-1.5 py-0.5 rounded-full">
                    ✓ Done
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/candidate/profile"
              onClick={onNavigate}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white text-[#1D4ED8] rounded-[10px] text-[12.5px] font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              View My Profile
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-[#F1F5F9] shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] w-full text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13.5px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
