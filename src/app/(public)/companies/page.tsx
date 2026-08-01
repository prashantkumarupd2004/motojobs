'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  BadgeCheck,
  Briefcase,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react';
import { EMPLOYER_TYPES } from '@/lib/automotive';

interface CompanyCard {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  industry: string | null;
  size: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  isVerified: boolean;
  openJobs: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (applied) params.set('search', applied);
    if (industries.length) params.set('industry', industries.join(','));
    const res = await fetch(`/api/companies?${params}`);
    return res.json();
  }, [page, applied, industries]);

  // The loading flag is raised by the handlers below, never here: setting state
  // synchronously inside an effect triggers a cascading render.
  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (cancelled) return;
        setCompanies(data.companies ?? []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const goToPage = (next: number) => {
    setLoading(true);
    setPage(next);
  };

  const toggleIndustry = (value: string) => {
    setLoading(true);
    setPage(1);
    setIndustries((list) =>
      list.includes(value) ? list.filter((i) => i !== value) : [...list, value]
    );
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setApplied(search.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
      <div className="max-w-2xl">
        <h1 className="text-[34px] sm:text-[42px] font-extrabold text-ink tracking-[-0.04em] leading-[1.1]">
          Automobile companies hiring now
        </h1>
        <p className="text-ink-muted text-[16px] leading-[1.7] mt-4">
          Dealerships, service centres, workshops, OEMs and EV companies across India.
          Explore who they are before you apply.
        </p>
      </div>

      <form onSubmit={submitSearch} className="mt-9 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-faint pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name"
            aria-label="Search companies"
            className="w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] pl-11 pr-4 py-3.5 border border-line outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]"
          />
        </div>
        <button
          type="submit"
          className="grad-brand text-white font-semibold text-[15px] rounded-[14px] px-7 py-3.5 shadow-brand hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
        >
          Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {EMPLOYER_TYPES.map((type) => {
          const active = industries.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleIndustry(type)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-all duration-300 ${
                active
                  ? 'bg-brand-600 border-brand-600 text-white shadow-[0_3px_10px_rgba(15,76,129,0.22)]'
                  : 'bg-white border-line text-ink-muted hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {type}
              {active && <X className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      <p className="mt-7 text-[13.5px] font-medium text-ink-faint">
        {loading ? 'Loading companies…' : `${total} ${total === 1 ? 'company' : 'companies'}`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="surface p-6 animate-pulse">
              <div className="w-14 h-14 rounded-[16px] bg-canvas" />
              <div className="h-4 w-2/3 bg-canvas rounded-full mt-5" />
              <div className="h-3 w-1/2 bg-canvas rounded-full mt-3" />
              <div className="h-3 w-full bg-canvas rounded-full mt-5" />
              <div className="h-3 w-4/5 bg-canvas rounded-full mt-2.5" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="surface p-12 mt-5 text-center">
          <Building2 className="w-10 h-10 text-ink-faint mx-auto" />
          <h2 className="text-[18px] font-bold text-ink mt-4">No companies found</h2>
          <p className="text-ink-muted text-[14.5px] mt-2">
            Try a different name, or clear the filters above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={c.slug ? `/company/${c.slug}` : '/companies'}
              className="surface sheen p-6 flex flex-col hover:-translate-y-1 hover:shadow-e4 transition-all duration-400 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 shrink-0 rounded-[16px] bg-canvas border border-line flex items-center justify-center overflow-hidden">
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-ink-faint" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-bold text-ink tracking-[-0.02em] truncate flex items-center gap-1.5">
                    {c.name}
                    {c.isVerified && (
                      <BadgeCheck
                        className="w-4 h-4 shrink-0 text-brand-600"
                        aria-label="Verified"
                      />
                    )}
                  </h2>
                  {c.industry && (
                    <p className="text-[13px] text-ink-muted mt-1 truncate">{c.industry}</p>
                  )}
                </div>
              </div>

              {c.description && (
                <p className="text-[13.5px] text-ink-muted leading-[1.65] mt-4 line-clamp-2">
                  {c.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 pt-5 border-t border-line text-[12.5px] text-ink-faint font-medium">
                {(c.city || c.state) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {[c.city, c.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {c.size && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {c.size}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-ignite-600">
                  <Briefcase className="w-3.5 h-3.5" />
                  {c.openJobs} open {c.openJobs === 1 ? 'role' : 'roles'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2.5 rounded-[12px] border border-line bg-white text-[14px] font-semibold text-ink-muted disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-200 hover:text-brand-700 transition-all duration-300"
          >
            Previous
          </button>
          <span className="px-4 text-[13.5px] font-medium text-ink-faint">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-4 py-2.5 rounded-[12px] border border-line bg-white text-[14px] font-semibold text-ink-muted disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-200 hover:text-brand-700 transition-all duration-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
