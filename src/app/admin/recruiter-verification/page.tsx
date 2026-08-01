'use client';

import React, { useState } from 'react';
import {
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  Globe,
  FileCheck,
  Clock,
  Users,
  Briefcase,
  Eye,
  Search,
  AlertCircle,
} from 'lucide-react';

type VerificationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
type DocStatus = 'verified' | 'pending' | 'missing';

interface CompanyDocument {
  name: string;
  status: DocStatus;
}

interface CompanyRecord {
  id: number;
  companyName: string;
  recruiterName: string;
  email: string;
  website: string;
  industry: string;
  companySize: string;
  location: string;
  submittedDate: string;
  status: VerificationStatus;
  initials: string;
  color: string;
  documents: CompanyDocument[];
  gstNumber: string;
}

const companies: CompanyRecord[] = [
  {
    id: 1, companyName: 'Competent Automobiles Co. Ltd', recruiterName: 'Deepak Goyal', email: 'deepak.goyal@competentauto.in',
    website: 'www.competentautomobiles.com', industry: 'Dealership', companySize: '1001–5,000',
    location: 'Gurugram, Haryana', submittedDate: '2024-04-10', status: 'Pending',
    initials: 'CA', color: 'bg-critical', gstNumber: '06AABCC1234M1Z5',
    documents: [
      { name: 'GST Certificate', status: 'verified' },
      { name: 'OEM Dealership Agreement', status: 'pending' },
      { name: 'Company PAN', status: 'verified' },
    ],
  },
  {
    id: 2, companyName: 'Landmark Cars Ltd', recruiterName: 'Harshil Mathur', email: 'harshil@landmarkcars.in',
    website: 'www.landmarkcars.com', industry: 'Dealership', companySize: '1001–5,000',
    location: 'Pune, Maharashtra', submittedDate: '2024-04-09', status: 'Under Review',
    initials: 'LC', color: 'bg-blue-500', gstNumber: '27AABCL5678M1ZK',
    documents: [
      { name: 'GST Certificate', status: 'verified' },
      { name: 'OEM Dealership Agreement', status: 'verified' },
      { name: 'Company PAN', status: 'pending' },
    ],
  },
  {
    id: 3, companyName: 'Bosch Car Service India', recruiterName: 'Mrinal Singh', email: 'mrinal.singh@boschcarservice.in',
    website: 'www.boschcarservice.in', industry: 'Authorised Service Centre', companySize: '10,001+',
    location: 'Nashik, Maharashtra', submittedDate: '2024-04-08', status: 'Approved',
    initials: 'BO', color: 'bg-positive', gstNumber: '27AABCB9012M1ZP',
    documents: [
      { name: 'GST Certificate', status: 'verified' },
      { name: 'Trade Licence', status: 'verified' },
      { name: 'Company PAN', status: 'verified' },
    ],
  },
  {
    id: 4, companyName: 'Sundaram Clayton Ltd', recruiterName: 'Kiran Kumar', email: 'kiran.kumar@sundaramclayton.in',
    website: 'www.sundaram-clayton.com', industry: 'Auto Component Manufacturer', companySize: '5001–10,000',
    location: 'Chennai, Tamil Nadu', submittedDate: '2024-04-07', status: 'Pending',
    initials: 'SC', color: 'bg-ignite-500', gstNumber: '33AABCS3456M1ZL',
    documents: [
      { name: 'GST Certificate', status: 'pending' },
      { name: 'Factory Licence', status: 'pending' },
      { name: 'Company PAN', status: 'pending' },
    ],
  },
  {
    id: 5, companyName: 'Speedways Multi-brand Workshop', recruiterName: 'Nisha Gupta', email: 'nisha.gupta@speedwaysauto.in',
    website: 'www.speedwaysauto.in', industry: 'Multi-brand Workshop', companySize: '51–200',
    location: 'Mumbai, Maharashtra', submittedDate: '2024-04-06', status: 'Rejected',
    initials: 'SP', color: 'bg-orange-500', gstNumber: '27AABCS7890M1ZR',
    documents: [
      { name: 'GST Certificate', status: 'verified' },
      { name: 'Trade Licence', status: 'missing' },
      { name: 'Company PAN', status: 'missing' },
    ],
  },
  {
    id: 6, companyName: 'Ather Energy Pvt Ltd', recruiterName: 'Rajeev Mishra', email: 'rajeev.mishra@atherenergy.in',
    website: 'www.atherenergy.com', industry: 'EV Startup', companySize: '501–1,000',
    location: 'Bengaluru, Karnataka', submittedDate: '2024-04-05', status: 'Under Review',
    initials: 'AE', color: 'bg-yellow-500', gstNumber: '29AABCA2345M1ZQ',
    documents: [
      { name: 'GST Certificate', status: 'verified' },
      { name: 'Business Registration', status: 'verified' },
      { name: 'Company PAN', status: 'pending' },
    ],
  },
];

const stats = [
  { label: 'Pending Review', value: '8', icon: Clock, color: 'text-[#9A5D00]', bg: 'bg-caution-soft border-[#F3DBB4]' },
  { label: 'Verified Companies', value: '156', icon: Shield, color: 'text-[#0A7A54]', bg: 'bg-positive-soft border-[#BEE7D8]' },
  { label: 'Rejected', value: '12', icon: XCircle, color: 'text-[#B32B2B]', bg: 'bg-critical-soft border-[#F3C9C9]' },
];

type TabOption = VerificationStatus | 'All';
const tabs: TabOption[] = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

const statusBadge: Record<VerificationStatus, string> = {
  Pending: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
  'Under Review': 'bg-brand-50 text-brand-600 border border-brand-100',
  Approved: 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]',
  Rejected: 'bg-critical-soft text-[#B32B2B] border border-[#F3C9C9]',
};

const statusIcon: Record<VerificationStatus, React.ReactNode> = {
  Pending: <Clock className="w-3 h-3 mr-1" />,
  'Under Review': <AlertCircle className="w-3 h-3 mr-1" />,
  Approved: <CheckCircle className="w-3 h-3 mr-1" />,
  Rejected: <XCircle className="w-3 h-3 mr-1" />,
};

function DocStatusBadge({ doc }: { doc: CompanyDocument }) {
  const cfg: Record<DocStatus, { cls: string; icon: React.ReactNode }> = {
    verified: { cls: 'text-[#0A7A54]', icon: <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> },
    pending: { cls: 'text-[#9A5D00]', icon: <Clock className="w-3.5 h-3.5 flex-shrink-0" /> },
    missing: { cls: 'text-ink-faint', icon: <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> },
  };
  const c = cfg[doc.status];
  return (
    <div className={`flex items-center gap-1.5 text-xs ${c.cls}`}>
      {c.icon}
      <span>{doc.name}</span>
      <span className="text-ink-faint capitalize ml-auto">({doc.status})</span>
    </div>
  );
}

export default function RecruiterVerificationPage() {
  const [activeTab, setActiveTab] = useState<TabOption>('All');
  const [search, setSearch] = useState('');

  const filtered = companies.filter((c) => {
    const matchTab = activeTab === 'All' || c.status === activeTab;
    const matchSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.recruiterName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCount = (tab: TabOption) =>
    tab === 'All' ? companies.length : companies.filter((c) => c.status === tab).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Recruiter Verification</h1>
          <p className="text-ink-muted text-sm mt-1">Verify company documents, GST certificates and business registrations</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <FileCheck className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded-[16px] p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg border ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{s.value}</p>
              <p className="text-ink-muted text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex gap-1 bg-white border border-line rounded-[16px] p-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-canvas'}`}>
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search company or recruiter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-line rounded-[16px] py-16 text-center text-ink-faint">
          No companies found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((company) => (
            <div key={company.id} className="bg-white border border-line rounded-[16px] p-5 flex flex-col gap-4 hover:border-line transition-colors">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-[16px] ${company.color} flex items-center justify-center text-ink font-bold text-sm flex-shrink-0 shadow-[0_4px_8px_rgba(16,24,40,0.04),0_12px_24px_rgba(16,24,40,0.06)]`}>
                    {company.initials}
                  </div>
                  <div>
                    <p className="text-ink font-semibold text-sm leading-tight">{company.companyName}</p>
                    <p className="text-ink-muted text-xs mt-0.5">{company.recruiterName}</p>
                    <p className="text-ink-faint text-xs">{company.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge[company.status]}`}>
                  {statusIcon[company.status]}{company.status}
                </span>
              </div>

              {/* Company Meta */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Briefcase className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
                  {company.industry}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Users className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
                  {company.companySize} employees
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Globe className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
                  <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors truncate">
                    {company.website}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Building2 className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
                  {company.location}
                </div>
              </div>

              {/* GST Info */}
              <div className="flex items-center gap-2 bg-white/50 border border-line rounded-lg px-3 py-2">
                <Shield className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <div>
                  <p className="text-ink-faint text-xs">GST Number</p>
                  <p className="text-ink text-xs font-mono tracking-wide">{company.gstNumber}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-ink-faint">
                  <Clock className="w-3 h-3" />
                  {new Date(company.submittedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white/60 rounded-lg p-3 space-y-2">
                <p className="text-ink-faint text-xs font-medium uppercase tracking-wide mb-2">Verification Documents</p>
                {company.documents.map((doc) => (
                  <DocStatusBadge key={doc.name} doc={doc} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex items-center justify-center gap-1.5 bg-canvas hover:bg-line text-ink py-2 px-3 rounded-lg text-xs font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  View Docs
                </button>
                {company.status !== 'Approved' && company.status !== 'Rejected' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-positive hover:bg-emerald-700 text-ink py-2 rounded-lg text-xs font-medium transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Company
                  </button>
                )}
                {company.status !== 'Rejected' && (
                  <button className="flex items-center justify-center gap-1.5 bg-critical-soft hover:bg-critical-soft text-[#B32B2B] border border-[#F3C9C9] py-2 px-3 rounded-lg text-xs font-medium transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
                {company.status === 'Rejected' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-caution-soft hover:bg-caution-soft text-[#9A5D00] border border-[#F3DBB4] py-2 rounded-lg text-xs font-medium transition-colors">
                    <Clock className="w-3.5 h-3.5" />
                    Re-queue for Review
                  </button>
                )}
                {company.status === 'Approved' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-critical-soft hover:bg-critical-soft text-[#B32B2B] border border-[#F3C9C9] py-2 rounded-lg text-xs font-medium transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Revoke Approval
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
