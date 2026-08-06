'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Blocks,
  Briefcase,
  Building2,
  CalendarCheck,
  FileText,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * One privileged role, so there is no per-item permission check here — the
 * proxy gates /admin wholesale and every API route calls `requireAdmin`.
 */
const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ href: string; icon: typeof LayoutDashboard; label: string }>;
}> = [
  {
    label: 'Overview',
    items: [{ href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/job-seekers', icon: Users, label: 'Job Seekers' },
      { href: '/admin/employers', icon: UserCog, label: 'Employers' },
      { href: '/admin/companies', icon: Building2, label: 'Companies' },
    ],
  },
  {
    label: 'Hiring',
    items: [
      { href: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
      { href: '/admin/applications', icon: FileText, label: 'Applications' },
      { href: '/admin/interviews', icon: CalendarCheck, label: 'Interviews' },
    ],
  },
  {
    label: 'Taxonomy',
    items: [
      { href: '/admin/categories', icon: Blocks, label: 'Categories' },
      { href: '/admin/skills', icon: Sparkles, label: 'Skills' },
      { href: '/admin/qualifications', icon: GraduationCap, label: 'Qualifications' },
      { href: '/admin/locations', icon: MapPin, label: 'Locations' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/blog', icon: FileText, label: 'Blog' },
      { href: '/admin/cms', icon: Blocks, label: 'CMS' },
      { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
      { href: '/admin/email-templates', icon: Mail, label: 'Email Templates' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
      { href: '/admin/support', icon: LifeBuoy, label: 'Support' },
      { href: '/admin/settings', icon: Settings, label: 'Website Settings' },
      { href: '/admin/security', icon: ShieldCheck, label: 'Security & Logs' },
      { href: '/admin/profile', icon: User, label: 'Profile' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  // The sign-in page lives under /admin so it shares the URL space, but it must
  // render bare: there is no session yet, so a sidebar of links the visitor
  // cannot follow would only be a dead frame around the form.
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} onLogout={logout} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#0B1220]/40" onClick={() => setMobileOpen(false)} />
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
        <header className="h-[64px] bg-white border-b border-line flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0">
          <button
            className="lg:hidden text-ink-soft hover:text-brand-700 p-2 -ml-2 rounded-[10px]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-bold text-ink truncate">
              {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Admin'}
            </p>
            <p className="text-[12px] text-ink-muted truncate">Platform control</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-2 text-[10.5px] text-ink-soft bg-canvas border border-line px-3 py-2 rounded-[10px] font-bold uppercase tracking-[0.1em]">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              Super Admin
            </span>
            <Link href="/admin/profile" aria-label="Profile">
              <span className="w-9 h-9 rounded-[11px] grad-brand flex items-center justify-center text-white text-[13px] font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-canvas p-4 sm:p-6">{children}</main>
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
    <aside className="flex flex-col h-full w-[256px] bg-white border-r border-line">
      <div className="flex items-center justify-between h-[64px] px-5 border-b border-line-soft shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[12px] grad-brand flex items-center justify-center">
            <Gauge className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-extrabold tracking-[-0.03em] text-ink">
              Motojobs.in
            </span>
            <span className="block text-[8.5px] font-bold tracking-[0.2em] text-ink-faint uppercase mt-1">
              Admin
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

      <nav className="flex-1 px-3 py-4 overflow-y-auto scroll-slim">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p className="px-3.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-[10px] transition-colors duration-200 ${
                      active
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-ink-muted hover:text-brand-700 hover:bg-canvas'
                    }`}
                  >
                    <Icon
                      className="w-[17px] h-[17px] shrink-0"
                      strokeWidth={active ? 2.4 : 2}
                    />
                    <span className="text-[13px]">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-line-soft shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-[10px] w-full text-ink-muted hover:text-critical hover:bg-critical-soft transition-colors duration-200"
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          <span className="text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
