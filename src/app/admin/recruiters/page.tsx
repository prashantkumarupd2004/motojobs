'use client';

import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Shield,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const stats = [
  { label: 'Total Recruiters', value: '342', icon: Building2, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-100' },
  { label: 'Active', value: '287', icon: CheckCircle, color: 'text-[#0A7A54]', bg: 'bg-positive-soft border-[#BEE7D8]' },
  { label: 'Pending Verification', value: '28', icon: Clock, color: 'text-[#9A5D00]', bg: 'bg-caution-soft border-[#F3DBB4]' },
  { label: 'Suspended', value: '27', icon: XCircle, color: 'text-[#B32B2B]', bg: 'bg-critical-soft border-[#F3C9C9]' },
];

type Status = 'Active' | 'Pending' | 'Suspended';
type Plan = 'Free' | 'Pro' | 'Enterprise';

interface Recruiter {
  id: number;
  company: string;
  name: string;
  email: string;
  plan: Plan;
  jobsPosted: number;
  status: Status;
  joinedDate: string;
  location: string;
}

const recruiters: Recruiter[] = [
  { id: 1, company: 'Competent Automobiles (Maruti Arena)', name: 'Rajesh Kumar', email: 'rajesh.kumar@competentauto.in', plan: 'Enterprise', jobsPosted: 142, status: 'Active', joinedDate: '2024-01-15', location: 'Gurugram' },
  { id: 2, company: 'Landmark Cars', name: 'Priya Sharma', email: 'priya.sharma@landmarkcars.in', plan: 'Enterprise', jobsPosted: 98, status: 'Active', joinedDate: '2024-02-03', location: 'Pune' },
  { id: 3, company: 'Hyundai Motor Plaza', name: 'Amit Patel', email: 'amit.patel@hyundaiplaza.in', plan: 'Pro', jobsPosted: 67, status: 'Active', joinedDate: '2024-02-18', location: 'Chennai' },
  { id: 4, company: 'Tata Motors Authorised Service', name: 'Sunita Verma', email: 'sunita.verma@tatamotorsservice.in', plan: 'Pro', jobsPosted: 54, status: 'Active', joinedDate: '2024-03-01', location: 'Jamshedpur' },
  { id: 5, company: 'Mahindra First Choice', name: 'Vikram Singh', email: 'vikram.singh@mahindrafirstchoice.in', plan: 'Pro', jobsPosted: 43, status: 'Pending', joinedDate: '2024-03-22', location: 'Hyderabad' },
  { id: 6, company: 'Star Auto Body Works', name: 'Deepa Nair', email: 'deepa.nair@starautobody.in', plan: 'Free', jobsPosted: 12, status: 'Pending', joinedDate: '2024-04-10', location: 'Ahmedabad' },
  { id: 7, company: 'Ather Energy', name: 'Sanjay Mehta', email: 'sanjay.mehta@atherenergy.in', plan: 'Enterprise', jobsPosted: 89, status: 'Active', joinedDate: '2024-01-28', location: 'Bengaluru' },
  { id: 8, company: 'TVS Motor Authorised Dealer', name: 'Ananya Bose', email: 'ananya.bose@tvsdealer.in', plan: 'Enterprise', jobsPosted: 115, status: 'Active', joinedDate: '2024-02-14', location: 'Hosur' },
  { id: 9, company: 'Speedways Multi-brand Workshop', name: 'Ravi Krishnan', email: 'ravi.krishnan@speedwaysauto.in', plan: 'Free', jobsPosted: 8, status: 'Suspended', joinedDate: '2024-03-05', location: 'Mumbai' },
  { id: 10, company: 'Bosch Car Service', name: 'Meena Joshi', email: 'meena.joshi@boschcarservice.in', plan: 'Pro', jobsPosted: 31, status: 'Suspended', joinedDate: '2024-01-10', location: 'Nashik' },
];

const planBadge: Record<Plan, string> = {
  Free: 'bg-canvas text-ink-soft border border-line',
  Pro: 'bg-brand-50 text-brand-600 border border-brand-100',
  Enterprise: 'bg-ignite-50 text-ignite-600 border border-ignite-100',
};

const statusBadge: Record<Status, string> = {
  Active: 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]',
  Pending: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
  Suspended: 'bg-critical-soft text-[#B32B2B] border border-[#F3C9C9]',
};

const statusIcon: Record<Status, React.ReactNode> = {
  Active: <CheckCircle className="w-3 h-3 mr-1" />,
  Pending: <Clock className="w-3 h-3 mr-1" />,
  Suspended: <XCircle className="w-3 h-3 mr-1" />,
};

const ITEMS_PER_PAGE = 7;

export default function RecruitersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [planFilter, setPlanFilter] = useState<'All' | Plan>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = recruiters.filter((r) => {
    const matchSearch =
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchPlan = planFilter === 'All' || r.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Recruiter Management</h1>
          <p className="text-ink-muted text-sm mt-1">Manage and monitor all registered recruiters on Motojobs.in</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white border border-line rounded-[16px] p-5 flex items-center gap-4`}>
            <div className={`p-3 rounded-lg border ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-ink-muted text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-[16px] p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search company, name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          {/* Status & Plan Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-line rounded-lg px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-ink-muted" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as 'All' | Status); setCurrentPage(1); }}
                className="bg-transparent text-sm text-ink-soft outline-none cursor-pointer pr-1"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-white border border-line rounded-lg px-2 py-1">
              <Shield className="w-3.5 h-3.5 text-ink-muted" />
              <select
                value={planFilter}
                onChange={(e) => { setPlanFilter(e.target.value as 'All' | Plan); setCurrentPage(1); }}
                className="bg-transparent text-sm text-ink-soft outline-none cursor-pointer pr-1"
              >
                <option value="All">All Plans</option>
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-[16px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-white/50">
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Company</th>
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Recruiter</th>
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Email</th>
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Plan</th>
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Jobs Posted</th>
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Status</th>
                <th className="text-left px-5 py-3.5 text-ink-muted font-medium">Joined</th>
                <th className="text-right px-5 py-3.5 text-ink-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-ink-faint">No recruiters match your filters.</td>
                </tr>
              ) : (
                paginated.map((r, idx) => (
                  <tr key={r.id} className={`border-b border-line hover:bg-canvas transition-colors ${idx % 2 === 0 ? '' : 'bg-white/50'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                          {r.company.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="text-ink font-medium leading-tight">{r.company}</p>
                          <p className="text-ink-faint text-xs">{r.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{r.name}</td>
                    <td className="px-5 py-4 text-ink-muted">{r.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadge[r.plan]}`}>
                        {r.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink font-semibold">{r.jobsPosted}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>
                        {statusIcon[r.status]}{r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-muted text-xs">{new Date(r.joinedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 hover:bg-canvas rounded-lg text-ink-muted hover:text-ink transition-colors" title="View Profile">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {r.status === 'Pending' && (
                          <button className="p-1.5 hover:bg-positive-soft rounded-lg text-ink-muted hover:text-[#0A7A54] transition-colors" title="Verify">
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {r.status === 'Active' && (
                          <button className="p-1.5 hover:bg-critical-soft rounded-lg text-ink-muted hover:text-[#B32B2B] transition-colors" title="Suspend">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="relative">
                          <button
                            className="p-1.5 hover:bg-canvas rounded-lg text-ink-muted hover:text-ink transition-colors"
                            onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          {openMenu === r.id && (
                            <div className="absolute right-0 top-8 z-10 bg-white border border-line rounded-lg shadow-[0_8px_16px_rgba(16,24,40,0.05),0_24px_48px_rgba(16,24,40,0.08)] py-1 w-36">
                              <button className="w-full text-left px-3 py-2 text-sm text-ink-soft hover:bg-white hover:text-ink" onClick={() => setOpenMenu(null)}>View Profile</button>
                              <button className="w-full text-left px-3 py-2 text-sm text-ink-soft hover:bg-white hover:text-ink" onClick={() => setOpenMenu(null)}>Send Message</button>
                              <button className="w-full text-left px-3 py-2 text-sm text-[#B32B2B] hover:bg-white" onClick={() => setOpenMenu(null)}>Delete Account</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-line">
          <p className="text-sm text-ink-muted">
            Showing <span className="text-ink font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</span>–<span className="text-ink font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="text-ink font-medium">{filtered.length}</span> recruiters
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-line text-ink-muted hover:text-ink hover:border-line disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? 'bg-brand-600 text-white' : 'text-ink-muted hover:text-ink hover:bg-canvas border border-line'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-line text-ink-muted hover:text-ink hover:border-line disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
