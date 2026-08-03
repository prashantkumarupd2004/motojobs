'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, User, LogOut, ChevronDown,
  Briefcase, LayoutDashboard, Bell,
  Home, Building2, BookOpen, Phone, Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import { usePathname } from 'next/navigation';

const NAV_LINKS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: 'Home',          href: '/',          icon: <Home className="w-4 h-4" /> },
  { label: 'Jobs',          href: '/jobs',       icon: <Briefcase className="w-4 h-4" /> },
  { label: 'Companies',     href: '/companies',  icon: <Building2 className="w-4 h-4" /> },
  { label: 'Career Advice', href: '/blog',       icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Contact Us',    href: '/contact',    icon: <Phone className="w-4 h-4" /> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { user, logout } = useAuth();
  const pathname  = usePathname();
  const menuRef   = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close user menu on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  /* ── Lock body scroll when mobile drawer open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* ── Close mobile on route change ── */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'CANDIDATE') return '/candidate/dashboard';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    return '/admin/dashboard';
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  /* ── initials helper ── */
  const initials = user
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <>
      {/* ════════════════════════════════════════
          NAV BAR
          ════════════════════════════════════════ */}
      <nav
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-white/90 backdrop-blur-2xl shadow-[0_2px_20px_rgba(15,23,42,0.08)] border-b border-white/60'
            : 'bg-white/80 backdrop-blur-xl border-b border-slate-100/80',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/logo-motojobs.png"
                alt="MotoJobs.in"
                width={1341}
                height={268}
                priority
                className="h-8 sm:h-9 w-auto transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center">
              {/* Pill container */}
              <div className="flex items-center bg-slate-50/80 border border-slate-200/60 rounded-2xl p-1 gap-0.5">
                {NAV_LINKS.map(({ label, href }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        'relative px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 select-none whitespace-nowrap',
                        active
                          ? 'bg-white text-[#1F5D95] shadow-[0_1px_4px_rgba(15,23,42,0.10),0_0_0_1px_rgba(31,93,149,0.08)]'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-white/60',
                      ].join(' ')}
                    >
                      {label}
                      {active && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1F5D95] opacity-70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Right Side ── */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <div className="w-9 h-9 flex items-center justify-center">
                    <NotificationBell />
                  </div>

                  {/* Dashboard shortcut */}
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-slate-600 hover:text-[#1F5D95] hover:bg-slate-50 rounded-xl transition-all duration-150"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>

                  {/* User avatar menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      id="user-menu-btn"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={[
                        'flex items-center gap-2 rounded-2xl pl-1 pr-3 py-1 border transition-all duration-200',
                        userMenuOpen
                          ? 'border-[#1F5D95]/30 bg-blue-50 shadow-[0_0_0_3px_rgba(31,93,149,0.08)]'
                          : 'border-slate-200 bg-white hover:border-[#1F5D95]/40 hover:shadow-[0_2px_10px_rgba(31,93,149,0.10)]',
                      ].join(' ')}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1F5D95] to-[#0A3255] flex items-center justify-center text-[11px] font-bold text-white tracking-wider shadow-inner">
                        {initials}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800 max-w-[80px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.04)] p-1.5 z-50 animate-[menuIn_0.15s_ease-out]"
                        style={{ transformOrigin: 'top right' }}
                      >
                        {/* User info header */}
                        <div className="px-3 py-2.5 mb-1 border-b border-slate-100">
                          <p className="text-[13px] font-semibold text-slate-800 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>

                        <Link
                          href={getDashboardLink()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1F5D95] rounded-xl transition-all duration-150"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#1F5D95]" />
                          </div>
                          Dashboard
                        </Link>

                        <div className="my-1 border-t border-slate-100" />

                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50/70 rounded-xl transition-all duration-150"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                          </div>
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-semibold text-[#0F172A] hover:text-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-[12px] transition-all duration-200 shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#2563EB]" />
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="relative group overflow-hidden flex items-center gap-2 px-5 py-2.5 text-[13.5px] font-bold text-white bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] hover:from-[#1D4ED8] hover:to-[#1D4ED8] rounded-[12px] shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_22px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97]"
                  >
                    {/* Subtle shine sweep effect on hover */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.2s_infinite]" />
                    <Zap className="w-4 h-4 fill-white text-white shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              id="mobile-menu-btn"
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
              >
                <X className="w-5 h-5" />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${mobileOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
              >
                <Menu className="w-5 h-5" />
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          MOBILE DRAWER OVERLAY
          ════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <div
          ref={drawerRef}
          className={`absolute top-0 right-0 h-full w-[82vw] max-w-[340px] bg-white shadow-[0_0_60px_rgba(15,23,42,0.20)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Image
                src="/logo-motojobs.png"
                alt="MotoJobs.in"
                width={1341}
                height={268}
                className="h-7 w-auto"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer nav links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {NAV_LINKS.map(({ label, href, icon }, i) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150',
                    'animate-[fadeSlideIn_0.3s_ease_both]',
                    active
                      ? 'bg-[#EFF6FF] text-[#1F5D95]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span className={`${active ? 'text-[#1F5D95]' : 'text-slate-400'} transition-colors`}>
                    {icon}
                  </span>
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1F5D95]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Drawer footer — auth actions */}
          <div className="px-4 pb-6 pt-4 border-t border-slate-100 space-y-2.5">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-[13px] font-bold text-white shadow-inner shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold text-slate-700 hover:text-[#2563EB] bg-white border border-slate-200 rounded-xl hover:border-[#BFDBFE] hover:bg-blue-50/40 transition-all duration-150"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                  Dashboard
                </Link>

                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold text-red-500 hover:text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-all duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-semibold text-[#0F172A] hover:text-[#2563EB] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:bg-[#EFF6FF] hover:border-[#BFDBFE] transition-all duration-150"
                >
                  <User className="w-4 h-4 text-[#64748B]" />
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-bold text-white bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] transition-all duration-200 active:scale-[0.97]"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  Get Started — It&apos;s Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── CSS keyframes (scoped, no Tailwind needed) ── */}
      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
