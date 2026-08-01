'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, FileText, Bookmark, CheckSquare, Bell, MessageSquare, Target, LogOut, Briefcase, ChevronLeft, ChevronRight, Menu, Gauge, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/candidate/profile', icon: User, label: 'My Profile' },
  { href: '/candidate/resume', icon: FileText, label: 'Resume Builder' },
  { href: '/candidate/skill-tests', icon: CheckSquare, label: 'Skill Tests' },
  { href: '/candidate/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  { href: '/candidate/applied-jobs', icon: Briefcase, label: 'My Applications' },
  { href: '/candidate/job-alerts', icon: Bell, label: 'Job Alerts' },
  { href: '/candidate/ai-assistant', icon: MessageSquare, label: 'AI Assistant' },
  { href: '/candidate/interview-prep', icon: Target, label: 'Interview Prep' },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`flex flex-col h-full bg-white border-r border-line transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        mobile ? 'w-[280px] shadow-[0_16px_32px_rgba(16,24,40,0.10),0_40px_80px_rgba(16,24,40,0.14)]' : collapsed ? 'w-[76px]' : 'w-[264px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-[72px] px-4 border-b border-line-soft shrink-0 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-[12px] grad-brand flex items-center justify-center shadow-[0_4px_10px_rgba(15,76,129,0.22)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
              <Gauge className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
              <span className="absolute inset-x-1.5 top-px h-px bg-white/45 rounded-full" />
            </div>
            <div className="leading-none">
              <span className="block text-[15.5px] font-extrabold tracking-[-0.03em] text-ink font-[family-name:var(--font-sora)]">Motojobs.in</span>
              <span className="block text-[8.5px] font-bold tracking-[0.2em] text-ink-faint uppercase mt-1">Candidate</span>
            </div>
          </Link>
        ) : (
          <div className="relative w-9 h-9 rounded-[12px] grad-brand flex items-center justify-center shadow-[0_4px_10px_rgba(15,76,129,0.22)]">
            <Gauge className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
          </div>
        )}
        {!mobile && !collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-ink-faint hover:text-brand-700 hover:bg-brand-50 p-1.5 rounded-[10px] transition-all duration-200"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && !mobile && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 text-ink-faint hover:text-brand-700 hover:bg-brand-50 p-1.5 rounded-[10px] transition-all duration-200"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* User Info */}
      {(!collapsed || mobile) && user && (
        <div className="px-4 py-4 shrink-0">
          <div className="flex items-center gap-3 bg-canvas border border-line-soft rounded-[16px] p-3">
            <div className="w-10 h-10 rounded-[12px] grad-brand flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[0_3px_8px_rgba(15,76,129,0.20)]">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-ink truncate leading-tight">{user.name}</p>
              <p className="text-[11.5px] text-ink-faint truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scroll-slim">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[13px] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group ${
                active
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
                  : 'text-ink-muted hover:text-brand-700 hover:bg-canvas'
              } ${collapsed && !mobile ? 'justify-center' : ''}`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full grad-ignite" />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} strokeWidth={active ? 2.4 : 2} />
              {(!collapsed || mobile) && <span className="text-[13.5px] font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-line-soft shrink-0">
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[13px] w-full text-ink-muted hover:text-critical hover:bg-critical-soft transition-all duration-300 ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {(!collapsed || mobile) && <span className="text-[13.5px] font-medium">Sign out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#0B1220]/35 backdrop-blur-[6px] animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-[72px] glass-nav border-b border-line flex items-center justify-between px-5 sm:px-7 shrink-0 z-10">
          <button
            className="lg:hidden text-ink-soft hover:text-brand-700 hover:bg-brand-50 p-2.5 rounded-[12px] transition-all duration-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className="hidden sm:inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft hover:text-brand-700 bg-white border border-line hover:border-brand-200 px-4 py-2.5 rounded-[12px] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)] hover:-translate-y-0.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
            >
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
            {user && (
              <div className="w-9 h-9 rounded-[12px] grad-brand flex items-center justify-center text-white text-[13px] font-bold shadow-[0_3px_8px_rgba(15,76,129,0.20)]">
                {user.name[0]}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-canvas p-5 sm:p-7 lg:p-9">
          <div className="animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
