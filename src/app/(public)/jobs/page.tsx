"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, MapPin, ChevronDown, Bell, Bookmark, BadgeCheck,
  Briefcase, IndianRupee, Clock, SlidersHorizontal, X,
  Building2, Zap, TrendingUp, Star, Filter, Loader2,
} from "lucide-react";
import type { Job } from "@/types";
import { JOB_CATEGORIES, salaryRangeLabel } from "@/lib/automotive";

/* ─── Static data ─────────────────────────────────────────── */

const POPULAR_SEARCHES = ["Service Advisor", "Technician", "Mechanic", "Sales Executive", "Parts Manager"];

const CATEGORY_FILTERS = [
  { label: "Service & Technical", count: 320 },
  { label: "Sales & Marketing",   count: 215 },
  { label: "Parts & Accessories", count: 180 },
  { label: "Management",          count: 145 },
  { label: "Others",              count: 80  },
];

const EXPERIENCE_FILTERS = [
  { label: "Fresher",    count: 120 },
  { label: "0-2 Years",  count: 310 },
  { label: "2-5 Years",  count: 420 },
  { label: "5-10 Years", count: 250 },
  { label: "10+ Years",  count: 150 },
];

const JOB_TYPE_FILTERS = [
  { label: "Full Time",  count: 850 },
  { label: "Part Time",  count: 120 },
  { label: "Contract",   count: 180 },
  { label: "Internship", count: 100 },
];

const CAREER_TIPS = [
  { title: "Top Skills Automotive Employers Look For in 2024", time: "5 min read", img: "/hero-car.png" },
  { title: "How to Prepare for a Technician Interview",        time: "7 min read", img: "/hero-professionals.png" },
  { title: "Career Growth in Automotive Industry",             time: "6 min read", img: "/hero-job.png" },
];

const STATIC_JOBS = [
  {
    id: "s1", title: "Service Advisor",
    company: "Hyundai Motors India",    logo: "/logos/hyundai.png",
    location: "Mumbai, Maharashtra",    experience: "2-5 Years",
    salary: "₹ 3.5 - 6 LPA",           posted: "2d ago",
    featured: true,  verified: true,   bg: "#003399",
  },
  {
    id: "s2", title: "Senior Technician – Engine",
    company: "Maruti Suzuki India Ltd.", logo: "/logos/marutisuzuki.png",
    location: "Delhi, India",           experience: "3-6 Years",
    salary: "₹ 4 - 7 LPA",             posted: "1d ago",
    featured: false, verified: true,   bg: "#003399",
  },
  {
    id: "s3", title: "Sales Executive – Commercial Vehicles",
    company: "Tata Motors",             logo: "/logos/tatamotors.png",
    location: "Pune, Maharashtra",      experience: "1-3 Years",
    salary: "₹ 2.5 - 4 LPA",           posted: "3d ago",
    featured: false, verified: true,   bg: "#1a1a2e",
  },
  {
    id: "s4", title: "Workshop Manager",
    company: "Mahindra & Mahindra Ltd.", logo: "/logos/mahindra.png",
    location: "Bangalore, Karnataka",   experience: "5-10 Years",
    salary: "₹ 8 - 12 LPA",            posted: "5d ago",
    featured: false, verified: false,  bg: "#cc0000",
  },
  {
    id: "s5", title: "Parts Manager",
    company: "TVS Motor Company",        logo: "/logos/tvsmotor.png",
    location: "Chennai, Tamil Nadu",    experience: "4-8 Years",
    salary: "₹ 5 - 9 LPA",             posted: "1w ago",
    featured: false, verified: true,   bg: "#003366",
  },
  {
    id: "s6", title: "EV Technician",
    company: "Ather Energy",            logo: "/logos/atherenergy.png",
    location: "Bengaluru, Karnataka",   experience: "1-3 Years",
    salary: "₹ 3 - 5 LPA",             posted: "2d ago",
    featured: true,  verified: true,   bg: "#00b894",
  },
  {
    id: "s7", title: "Auto Electrician",
    company: "Hero MotoCorp",           logo: "/logos/heromotocorp.png",
    location: "Gurugram, Haryana",      experience: "2-4 Years",
    salary: "₹ 2.5 - 4.5 LPA",         posted: "4d ago",
    featured: false, verified: true,   bg: "#cc0000",
  },
  {
    id: "s8", title: "Showroom Manager",
    company: "Bajaj Auto",              logo: "/logos/bajajauto.png",
    location: "Aurangabad, Maharashtra", experience: "5-8 Years",
    salary: "₹ 7 - 11 LPA",            posted: "6d ago",
    featured: false, verified: true,   bg: "#003399",
  },
];

type StaticJob = (typeof STATIC_JOBS)[0];

/* ─── Sub-components ─────────────────────────────────────── */

function CompanyLogo({ src, name, size = 56 }: { src: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  if (err || !src) {
    return (
      <div
        className="flex items-center justify-center rounded-[12px] font-bold text-white text-sm select-none"
        style={{ width: size, height: size, background: "#1e40af" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setErr(true)}
    />
  );
}

function FilterCheck({
  label, count, checked, onChange,
}: {
  label: string; count: number; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 py-[5px] cursor-pointer group select-none">
      <span className="flex items-center gap-2.5">
        <span
          className={[
            "w-[15px] h-[15px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150",
            checked
              ? "bg-[#2563EB] border-[#2563EB]"
              : "border-[#CBD5E1] group-hover:border-[#2563EB]",
          ].join(" ")}
          onClick={onChange}
        >
          {checked && (
            <svg viewBox="0 0 10 8" className="w-[9px] h-[9px]">
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white" strokeWidth="1.6" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={`text-[12.5px] leading-[1.4] ${checked ? "text-[#1E3A8A] font-semibold" : "text-[#475569] group-hover:text-[#1E293B]"} transition-colors`}>
          {label}
        </span>
      </span>
      <span
        className={`text-[10.5px] font-bold px-[7px] py-[1px] rounded-full shrink-0 ${checked ? "bg-[#2563EB] text-white" : "bg-[#EFF6FF] text-[#2563EB]"}`}
      >
        {count}
      </span>
    </label>
  );
}

function JobCard({
  job, bookmarked, onBookmark,
}: {
  job: StaticJob; bookmarked: boolean; onBookmark: () => void;
}) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="bg-white border border-[#E8EDF5] rounded-[18px] p-5 flex items-center gap-4 hover:shadow-[0_8px_32px_rgba(15,23,42,0.10)] hover:-translate-y-[2px] transition-all duration-200 group block"
      style={{ minHeight: 120 }}
    >
      {/* Logo */}
      <div className="w-[56px] h-[56px] rounded-[14px] border border-[#E8EDF5] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
        <CompanyLogo src={job.logo} name={job.company} size={44} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[2px]">
          <h3 className="text-[14.5px] font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate leading-snug">
            {job.title}
          </h3>
          {job.featured && (
            <span className="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-full px-2 py-[2px]">
              <Star className="w-[9px] h-[9px] fill-[#2563EB]" />
              Featured
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-[10px]">
          <span className="text-[12.5px] text-[#475569]">{job.company}</span>
          {job.verified && <BadgeCheck className="w-[14px] h-[14px] text-[#2563EB] shrink-0" />}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#64748B]">
          <span className="flex items-center gap-1">
            <MapPin className="w-[11px] h-[11px] shrink-0" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-[11px] h-[11px] shrink-0" />
            {job.experience}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee className="w-[11px] h-[11px] shrink-0" />
            {job.salary}
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex flex-col items-end gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
            <Clock className="w-[10px] h-[10px]" />
            {job.posted}
          </span>
          <button
            onClick={e => { e.preventDefault(); onBookmark(); }}
            className={`w-7 h-7 flex items-center justify-center rounded-[8px] border transition-all duration-150 ${
              bookmarked
                ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]"
                : "border-[#E8EDF5] text-[#94A3B8] hover:border-[#BFDBFE] hover:text-[#2563EB]"
            }`}
          >
            <Bookmark className={`w-[13px] h-[13px] ${bookmarked ? "fill-[#2563EB]" : ""}`} />
          </button>
        </div>
        <span className="px-[14px] py-[7px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold rounded-[10px] transition-all duration-150 active:scale-[0.97] shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
          Apply Now
        </span>
      </div>
    </Link>
  );
}

function FilterSidebar({
  checkedCats, setCheckedCats,
  checkedExp,  setCheckedExp,
  checkedTypes,setCheckedTypes,
  salaryMax,   setSalaryMax,
  clearAll,    hasFilters,
}: {
  checkedCats: string[];  setCheckedCats: (v: string[]) => void;
  checkedExp:  string[];  setCheckedExp:  (v: string[]) => void;
  checkedTypes: string[]; setCheckedTypes: (v: string[]) => void;
  salaryMax:   number;    setSalaryMax:   (v: number) => void;
  clearAll: () => void;   hasFilters: boolean;
}) {
  const toggle = (list: string[], set: (v: string[]) => void, val: string) =>
    set(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);

  return (
    <div className="bg-white border border-[#E8EDF5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-[15px] h-[15px] text-[#475569]" />
          <span className="text-[14px] font-bold text-[#0F172A]">Filters</span>
        </div>
        <button
          onClick={clearAll}
          className={`text-[12px] font-semibold transition-colors ${
            hasFilters ? "text-[#2563EB] hover:text-[#1D4ED8]" : "text-[#94A3B8]"
          }`}
        >
          Clear All
        </button>
      </div>

      {/* Job Category */}
      <p className="text-[10.5px] font-bold text-[#0F172A] uppercase tracking-[0.06em] mb-2">
        Job Category
      </p>
      <div className="space-y-[1px] mb-1">
        {CATEGORY_FILTERS.map(f => (
          <FilterCheck
            key={f.label} label={f.label} count={f.count}
            checked={checkedCats.includes(f.label)}
            onChange={() => toggle(checkedCats, setCheckedCats, f.label)}
          />
        ))}
      </div>
      <div className="border-t border-[#F1F5F9] my-3.5" />

      {/* Experience */}
      <p className="text-[10.5px] font-bold text-[#0F172A] uppercase tracking-[0.06em] mb-2">
        Experience
      </p>
      <div className="space-y-[1px] mb-1">
        {EXPERIENCE_FILTERS.map(f => (
          <FilterCheck
            key={f.label} label={f.label} count={f.count}
            checked={checkedExp.includes(f.label)}
            onChange={() => toggle(checkedExp, setCheckedExp, f.label)}
          />
        ))}
      </div>
      <div className="border-t border-[#F1F5F9] my-3.5" />

      {/* Job Type */}
      <p className="text-[10.5px] font-bold text-[#0F172A] uppercase tracking-[0.06em] mb-2">
        Job Type
      </p>
      <div className="space-y-[1px] mb-1">
        {JOB_TYPE_FILTERS.map(f => (
          <FilterCheck
            key={f.label} label={f.label} count={f.count}
            checked={checkedTypes.includes(f.label)}
            onChange={() => toggle(checkedTypes, setCheckedTypes, f.label)}
          />
        ))}
      </div>
      <div className="border-t border-[#F1F5F9] my-3.5" />

      {/* Salary Range */}
      <p className="text-[10.5px] font-bold text-[#0F172A] uppercase tracking-[0.06em] mb-3">
        Salary Range
      </p>
      <input
        type="range" min={0} max={2000000} step={50000}
        value={salaryMax}
        onChange={e => setSalaryMax(Number(e.target.value))}
        className="w-full h-[4px] rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #2563EB ${(salaryMax / 2000000) * 100}%, #E2E8F0 ${(salaryMax / 2000000) * 100}%)`,
          accentColor: "#2563EB",
        }}
      />
      <div className="flex justify-between text-[11px] text-[#64748B] mt-2 mb-1">
        <span>₹ 0</span>
        <span>₹ {salaryMax >= 2000000 ? "20,00,000+" : (salaryMax / 100000).toFixed(1) + "L"}</span>
      </div>
      <div className="border-t border-[#F1F5F9] my-3.5" />

      {/* Location search */}
      <p className="text-[10.5px] font-bold text-[#0F172A] uppercase tracking-[0.06em] mb-2">
        Location
      </p>
      <div className="flex items-center gap-2 border border-[#E8EDF5] rounded-[10px] px-3 py-2 bg-[#F8FAFC] focus-within:border-[#2563EB] transition-colors">
        <Search className="w-[13px] h-[13px] text-[#94A3B8] shrink-0" />
        <input
          placeholder="Search location"
          className="text-[12.5px] text-[#475569] placeholder-[#94A3B8] outline-none bg-transparent flex-1"
        />
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */

export default function JobsPage() {
  const [keyword,      setKeyword]     = useState("");
  const [location,     setLocation]    = useState("");
  const [category,     setCategory]    = useState("");
  const [catOpen,      setCatOpen]     = useState(false);
  const [checkedCats,  setCheckedCats] = useState<string[]>([]);
  const [checkedExp,   setCheckedExp]  = useState<string[]>([]);
  const [checkedTypes, setCheckedTypes]= useState<string[]>([]);
  const [salaryMax,    setSalaryMax]   = useState(2000000);
  const [bookmarks,    setBookmarks]   = useState<string[]>([]);
  const [filtersOpen,  setFiltersOpen] = useState(false);
  const [alertEmail,   setAlertEmail]  = useState("");
  const [alertSent,    setAlertSent]   = useState(false);
  const [liveJobs,     setLiveJobs]    = useState<Job[]>([]);
  const [total,        setTotal]       = useState(1250);
  const [loading,      setLoading]     = useState(false);
  const [sort,         setSort]        = useState("Latest");
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Lock body when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  const displayJobs: StaticJob[] = liveJobs.length
    ? liveJobs.map(j => ({
        id: j.id, title: j.title,
        company: j.company?.name || "Company",
        logo: j.company?.logo || "",
        location: j.location || "India",
        experience: j.experience || "Any",
        salary: salaryRangeLabel(j.minSalary, j.maxSalary),
        posted: new Date(j.createdAt).toLocaleDateString(),
        featured: false, verified: j.company?.isVerified || false,
        bg: "#1e40af",
      }))
    : STATIC_JOBS;

  const hasFilters = checkedCats.length > 0 || checkedExp.length > 0 || checkedTypes.length > 0 || salaryMax < 2000000;
  const clearAll = () => { setCheckedCats([]); setCheckedExp([]); setCheckedTypes([]); setSalaryMax(2000000); };

  const handleSubscribe = () => {
    if (alertEmail) { setAlertSent(true); setTimeout(() => setAlertSent(false), 3000); setAlertEmail(""); }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7F9FC" }}>

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "#0F2D58", minHeight: 265 }}>
        <Image
          src="/hero-job.png" alt="Automotive workshop background" fill
          className="object-cover object-center select-none"
          style={{ opacity: 0.25 }} priority
        />
        {/* Dark left-heavy gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(100deg,rgba(10,29,60,0.96) 40%,rgba(15,45,88,0.72) 100%)" }}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-9 pb-8">
          {/* Heading */}
          <h1 className="text-[30px] sm:text-[36px] lg:text-[40px] font-bold text-white leading-[1.18] mb-2 max-w-2xl tracking-tight">
            Find Your Dream Job in<br />
            Automotive Industry
          </h1>
          <p className="text-[13.5px] sm:text-[15px] text-[#93C5FD] mb-5 font-medium">
            Discover {total.toLocaleString()}+ job opportunities across dealerships, workshops and OEMs
          </p>

          {/* ── Search bar ── */}
          <div
            className="flex items-center bg-white rounded-[18px] shadow-[0_6px_30px_rgba(10,29,60,0.25)] overflow-visible max-w-[780px] relative"
            style={{ height: 70 }}
          >
            {/* Keyword */}
            <div className="flex items-center gap-2.5 flex-1 px-5 border-r border-[#E8EDF5] h-full min-w-0">
              <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Job title, role or keywords"
                className="flex-1 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none bg-transparent min-w-0"
              />
            </div>
            {/* Location */}
            <div className="flex items-center gap-2.5 w-[190px] px-4 border-r border-[#E8EDF5] h-full shrink-0">
              <MapPin className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City or location"
                className="flex-1 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none bg-transparent min-w-0"
              />
            </div>
            {/* Category dropdown */}
            <div
              ref={catRef}
              className="relative flex items-center gap-2 w-[175px] px-4 h-full cursor-pointer shrink-0 select-none"
              onClick={() => setCatOpen(!catOpen)}
            >
              <Briefcase className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <span className={`flex-1 text-[13.5px] truncate ${category ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
                {category || "Job category"}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
              {catOpen && (
                <div className="absolute top-full left-0 w-52 mt-2 bg-white border border-[#E8EDF5] rounded-[14px] shadow-[0_12px_40px_rgba(15,23,42,0.14)] z-40 py-1.5 max-h-60 overflow-y-auto">
                  <button
                    onClick={e => { e.stopPropagation(); setCategory(""); setCatOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 text-[12.5px] text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
                  >
                    All Categories
                  </button>
                  {JOB_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={e => { e.stopPropagation(); setCategory(c.label); setCatOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-[12.5px] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Search button */}
            <button className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-[13.5px] font-semibold px-7 h-full transition-colors shrink-0 rounded-r-[18px]">
              <Search className="w-[15px] h-[15px]" />
              Search Jobs
            </button>
          </div>

          {/* Popular searches */}
          <div className="flex items-center gap-2.5 mt-4 flex-wrap">
            <span className="text-[12.5px] text-[#93C5FD] font-medium shrink-0">Popular Searches:</span>
            {POPULAR_SEARCHES.map(s => (
              <button
                key={s}
                onClick={() => setKeyword(s)}
                className="text-[12px] text-white border border-white/25 rounded-full px-3 py-[4px] hover:bg-white/12 hover:border-white/50 transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAIN CONTENT — 3 COLUMN
      ══════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-7">
        <div className="flex gap-6 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block w-[232px] shrink-0 sticky top-[88px]">
            <FilterSidebar
              checkedCats={checkedCats} setCheckedCats={setCheckedCats}
              checkedExp={checkedExp}   setCheckedExp={setCheckedExp}
              checkedTypes={checkedTypes} setCheckedTypes={setCheckedTypes}
              salaryMax={salaryMax}     setSalaryMax={setSalaryMax}
              clearAll={clearAll}       hasFilters={hasFilters}
            />
          </aside>

          {/* ── CENTER: JOB LISTINGS ── */}
          <main className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-bold text-[#0F172A]">
                {total.toLocaleString()} Jobs Found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-[#64748B]">Sort by:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="appearance-none text-[13px] font-semibold text-[#0F172A] bg-white border border-[#E8EDF5] rounded-[10px] px-3 pr-8 py-[6px] outline-none cursor-pointer"
                  >
                    <option>Latest</option>
                    <option>Most Relevant</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />
                </div>
              </div>
            </div>

            {/* Mobile filter button */}
            <button
              className="lg:hidden flex items-center gap-2 mb-4 text-[13px] font-semibold text-[#2563EB] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2 rounded-[10px] hover:bg-[#DBEAFE] transition-colors"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                  {checkedCats.length + checkedExp.length + checkedTypes.length}
                </span>
              )}
            </button>

            {/* Job cards */}
            <div className="space-y-[16px]">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                </div>
              ) : (
                displayJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    bookmarked={bookmarks.includes(job.id)}
                    onBookmark={() =>
                      setBookmarks(prev =>
                        prev.includes(job.id) ? prev.filter(b => b !== job.id) : [...prev, job.id]
                      )
                    }
                  />
                ))
              )}
            </div>

            {/* Load more */}
            <div className="text-center mt-8">
              <button className="px-8 py-[10px] border border-[#E8EDF5] bg-white text-[13.5px] font-semibold text-[#475569] rounded-[12px] hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-[0_2px_12px_rgba(37,99,235,0.10)] transition-all duration-200">
                Load More Jobs
              </button>
            </div>
          </main>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden xl:block w-[245px] shrink-0 sticky top-[88px] space-y-4">

            {/* Widget 1: Job Alerts */}
            <div className="bg-white border border-[#E8EDF5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <Bell className="w-[18px] h-[18px] text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#0F172A] leading-tight">Get Job Alerts</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">Get the latest jobs directly in your inbox</p>
                </div>
              </div>
              <input
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                className="w-full border border-[#E8EDF5] rounded-[10px] px-3.5 py-[9px] text-[12.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] transition-colors mb-2"
              />
              <button
                onClick={handleSubscribe}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold py-[9px] rounded-[10px] transition-colors active:scale-[0.98]"
              >
                {alertSent ? "✓ Subscribed!" : "Subscribe"}
              </button>
            </div>

            {/* Widget 2: Career Tips */}
            <div className="bg-white border border-[#E8EDF5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13.5px] font-bold text-[#0F172A]">Career Tips</p>
                <Link href="/blog" className="text-[11.5px] font-semibold text-[#2563EB] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {CAREER_TIPS.map((tip, i) => (
                  <Link key={i} href="/blog" className="flex gap-3 group">
                    <div className="w-[54px] h-[42px] rounded-[8px] overflow-hidden shrink-0 bg-[#F1F5F9]">
                      <Image
                        src={tip.img} alt={tip.title}
                        width={54} height={42}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold text-[#1E293B] group-hover:text-[#2563EB] leading-snug line-clamp-2 transition-colors">
                        {tip.title}
                      </p>
                      <p className="text-[10.5px] text-[#94A3B8] mt-0.5">{tip.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Widget 3: Employer CTA */}
            <div className="bg-white border border-[#E8EDF5] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
              <div className="relative w-full h-[80px] mb-3 rounded-[12px] overflow-hidden bg-[#F0F6FB]">
                <Image src="/hero-professionals.png" alt="Post a job" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <p className="text-[15px] font-bold text-[#0F172A] mb-1 text-center leading-tight">
                Looking for<br />top talent?
              </p>
              <p className="text-[11px] text-[#64748B] text-center mb-3 leading-snug">
                Post your job and connect with qualified automotive professionals.
              </p>
              <Link
                href="/recruiter/dashboard"
                className="flex items-center justify-center gap-1.5 w-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-[12.5px] font-semibold py-[9px] rounded-[10px] transition-colors border border-[#BFDBFE]"
              >
                <Briefcase className="w-[13px] h-[13px]" />
                Post a Job
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM FEATURE CARDS
      ══════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Building2 className="w-[18px] h-[18px] text-[#2563EB]" />,
              title: "Trusted by Top Companies",
              body: "Work with leading automotive brands",
            },
            {
              icon: <BadgeCheck className="w-[18px] h-[18px] text-[#2563EB]" />,
              title: "Verified Job Listings",
              body: "100% verified and genuine opportunities",
            },
            {
              icon: <Zap className="w-[18px] h-[18px] text-[#2563EB]" />,
              title: "Easy Application Process",
              body: "Apply in just a few clicks",
            },
            {
              icon: <TrendingUp className="w-[18px] h-[18px] text-[#2563EB]" />,
              title: "Career Growth",
              body: "Find jobs that grow with you",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white border border-[#E8EDF5] rounded-[16px] p-4 flex items-start gap-3 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] hover:-translate-y-[1px] transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-[12.5px] font-bold text-[#0F172A] leading-tight">{f.title}</p>
                <p className="text-[11.5px] text-[#64748B] mt-[3px] leading-snug">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE FILTER DRAWER
      ══════════════════════════════════════ */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F1F5F9] sticky top-0 bg-white z-10">
              <span className="text-[16px] font-bold text-[#0F172A]">Filters</span>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <FilterSidebar
                checkedCats={checkedCats} setCheckedCats={setCheckedCats}
                checkedExp={checkedExp}   setCheckedExp={setCheckedExp}
                checkedTypes={checkedTypes} setCheckedTypes={setCheckedTypes}
                salaryMax={salaryMax}     setSalaryMax={setSalaryMax}
                clearAll={clearAll}       hasFilters={hasFilters}
              />
            </div>
            <div className="sticky bottom-0 px-5 pt-3 pb-6 border-t border-[#F1F5F9] bg-white">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[15px] font-semibold py-3.5 rounded-[14px] transition-colors active:scale-[0.98]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for range input thumb */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2563EB;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(37,99,235,0.35);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2563EB;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(37,99,235,0.35);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
