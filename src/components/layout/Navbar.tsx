'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import { usePathname } from 'next/navigation';

const NAV_LINKS: [string, string][] = [
  ['Home',            '/'],
  ['Jobs',            '/jobs'],
  ['Companies',       '/companies'],
  ['Career Advice',   '/blog'],
  ['Contact Us',      '/contact'],
];


export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [userMenuOpen]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'CANDIDATE') return '/candidate/dashboard';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    return '/admin/dashboard';
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled
          ? 'shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.04)]'
          : ''
      } border-b border-[#E8EEF8]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[84px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center group shrink-0 py-1">
            <Image
              src="/logo-motojobs.png"
              alt="MotoJobs.in"
              width={1341}
              height={268}
              preload
              className="h-9 sm:h-10 w-auto"
            />
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(([label, href]) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 text-[13.5px] font-medium rounded-[8px] transition-colors duration-150 ${
                    active
                      ? 'text-[#2563EB]'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {label}
                  {/* Active underline */}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right side ── */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  href={getDashboardLink()}
                  className="px-3 py-2 text-[13.5px] font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-[8px] transition-all duration-150"
                >
                  Dashboard
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-full pl-1 pr-3 py-1 hover:border-[#BFDBFE] hover:shadow-[0_2px_8px_rgba(37,99,235,0.08)] transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-[12px] font-bold text-white">
                      {user.name[0]}
                    </div>
                    <span className="text-[13px] font-semibold text-[#0F172A]">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.10)] animate-scale-in origin-top-right p-1 z-50">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] rounded-[10px] transition-all duration-150"
                      >
                        <User className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-all duration-150"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login — outlined pill button */}
                <Link
                  href="/login"
                  className="px-5 py-2 text-[13.5px] font-semibold text-[#0F172A] border border-[#CBD5E1] rounded-full hover:border-[#94A3B8] hover:bg-[#F8FAFC] transition-all duration-150"
                >
                  Login
                </Link>
                {/* Register — solid blue */}
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13.5px] font-semibold px-5 py-2 rounded-full transition-all duration-150 shadow-[0_1px_3px_rgba(37,99,235,0.20)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile menu button ── */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-[8px] transition-all duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8EEF8] bg-white px-4 py-3 space-y-0.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] animate-fade-in">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center text-[14.5px] font-medium px-3 py-3 rounded-[10px] transition-all duration-150 ${
                isActive(href)
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center text-[14.5px] font-medium text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC] px-3 py-3 rounded-[10px] transition-all duration-150"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="w-full text-left text-[14.5px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] px-3 py-3 rounded-[10px] transition-all duration-150"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2 pb-1">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center border border-[#CBD5E1] text-[#0F172A] font-semibold py-2.5 rounded-full text-[14px] hover:bg-[#F8FAFC] transition-all duration-150"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center bg-[#2563EB] text-white font-semibold py-2.5 rounded-full text-[14px] shadow-[0_2px_8px_rgba(37,99,235,0.25)]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
