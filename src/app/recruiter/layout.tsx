'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CalendarCheck,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/layout/NotificationBell';

const NAV_ITEMS = [
  { href: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/recruiter/post-job', icon: PlusCircle, label: 'Post Job' },
  { href: '/recruiter/manage-jobs', icon: Briefcase, label: 'Manage Jobs' },
  { href: '/recruiter/applications', icon: Users, label: 'Applications' },
  { href: '/recruiter/candidate-search', icon: Search, label: 'Candidate Search' },
  { href: '/recruiter/saved-candidates', icon: Bookmark, label: 'Saved Candidates' },
  { href: '/recruiter/interviews', icon: CalendarCheck, label: 'Interviews' },
  { href: '/recruiter/reports', icon: BarChart3, label: 'Reports & Analytics' },
  { href: '/recruiter/company', icon: Building2, label: 'Company Profile' },
  { href: '/recruiter/notifications', icon: Bell, label: 'Notifications' },
  { href: '/recruiter/settings', icon: Settings, label: 'Settings' },
];

interface CompanyIdentity {
  name: string;
  logo: string | null;
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const [company, setCompany] = useState<CompanyIdentity | null>(null);

  const onboarding = pathname === '/recruiter/onboarding';

  // An employer who never finished the wizard has no usable dashboard, so send
  // them back to it rather than showing empty cards. The same call supplies the
  // header identity — `useAuth` only mirrors localStorage, which is empty on a
  // fresh login.
  useEffect(() => {
    if (onboarding) return;
    let cancelled = false;
    fetch('/api/recruiter/onboarding')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.data) return;
        if (!data.data.isProfileComplete) {
          router.replace('/recruiter/onboarding');
          return;
        }
        setCompany({ name: data.data.name ?? '', logo: data.data.logo ?? null });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [onboarding, router]);

  // The wizard is a full-page flow — no shell around it.
  if (onboarding) return <>{children}</>;

  const initial = company?.name?.[0]?.toUpperCase() ?? 'C';

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} onLogout={logout} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#0B1220]/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 shadow-e4 animate-slide-in">
            <Sidebar
              mobile
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={logout}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[72px] bg-white border-b border-line flex items-center justify-between gap-3 px-5 sm:px-7 shrink-0">
          <button
            className="lg:hidden text-ink-soft hover:text-brand-700 p-2 -ml-2 rounded-[10px]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-ink truncate">
              Hello, {company?.name || 'there'} 👋
            </p>
            <p className="text-[12.5px] text-ink-muted truncate">Welcome back</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <Link
              href="/recruiter/settings"
              aria-label="Settings"
              className="w-9 h-9 rounded-[11px] border border-line flex items-center justify-center text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors"
            >
              <Settings className="w-[17px] h-[17px]" />
            </Link>
            <Link href="/recruiter/company" aria-label="Company profile">
              {company?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo}
                  alt=""
                  className="w-9 h-9 rounded-[11px] object-cover border border-line bg-white"
                />
              ) : (
                <span className="w-9 h-9 rounded-[11px] grad-brand flex items-center justify-center text-white text-[13px] font-bold">
                  {initial}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-canvas p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  mobile = false,
  pathname,
  onNavigate,
  onLogout,
}: {
  mobile?: boolean;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="flex flex-col h-full w-[264px] bg-white border-r border-line">
      <div className="flex items-center justify-between h-[72px] px-5 border-b border-line-soft shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[12px] grad-brand flex items-center justify-center">
            <Gauge className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
          </span>
          <span className="leading-none">
            <span className="block text-[15.5px] font-extrabold tracking-[-0.03em] text-ink">
              Motojobs.in
            </span>
            <span className="block text-[8.5px] font-bold tracking-[0.2em] text-ink-faint uppercase mt-1">
              Employer
            </span>
          </span>
        </Link>
        {mobile && (
          <button
            onClick={onNavigate}
            aria-label="Close menu"
            className="text-ink-faint hover:text-ink p-1.5 rounded-[10px]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-slim">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] transition-colors duration-200 ${
                active
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-ink-muted hover:text-brand-700 hover:bg-canvas'
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.4 : 2} />
              <span className="text-[13.5px]">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line-soft shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] w-full text-ink-muted hover:text-critical hover:bg-critical-soft transition-colors duration-200"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span className="text-[13.5px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
