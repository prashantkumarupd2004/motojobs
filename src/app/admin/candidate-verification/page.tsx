'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  Search,
} from 'lucide-react';

type VerificationStatus = 'Pending' | 'Under Review' | 'Verified' | 'Rejected';

type DocStatus = 'verified' | 'pending' | 'missing';

interface Document {
  name: string;
  status: DocStatus;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  location: string;
  submittedDate: string;
  status: VerificationStatus;
  initials: string;
  color: string;
  documents: Document[];
  phone: string;
}

const candidates: Candidate[] = [
  {
    id: 1, name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', location: 'Mumbai, Maharashtra',
    submittedDate: '2024-04-10', status: 'Pending', initials: 'AM', color: 'bg-brand-500',
    phone: '+91 98765 43210',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'pending' },
      { name: 'Degree Certificate', status: 'missing' },
    ],
  },
  {
    id: 2, name: 'Kavya Reddy', email: 'kavya.reddy@outlook.com', location: 'Hyderabad, Telangana',
    submittedDate: '2024-04-09', status: 'Under Review', initials: 'KR', color: 'bg-ignite-500',
    phone: '+91 87654 32109',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'verified' },
      { name: 'Degree Certificate', status: 'pending' },
    ],
  },
  {
    id: 3, name: 'Rohan Desai', email: 'rohan.desai@yahoo.com', location: 'Pune, Maharashtra',
    submittedDate: '2024-04-08', status: 'Verified', initials: 'RD', color: 'bg-positive',
    phone: '+91 76543 21098',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'verified' },
      { name: 'Degree Certificate', status: 'verified' },
    ],
  },
  {
    id: 4, name: 'Sneha Iyer', email: 'sneha.iyer@gmail.com', location: 'Chennai, Tamil Nadu',
    submittedDate: '2024-04-08', status: 'Rejected', initials: 'SI', color: 'bg-critical',
    phone: '+91 65432 10987',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'missing' },
      { name: 'Degree Certificate', status: 'missing' },
    ],
  },
  {
    id: 5, name: 'Nikhil Sharma', email: 'nikhil.sharma@proton.me', location: 'Delhi, NCR',
    submittedDate: '2024-04-07', status: 'Pending', initials: 'NS', color: 'bg-blue-500',
    phone: '+91 54321 09876',
    documents: [
      { name: 'Aadhar Card', status: 'pending' },
      { name: 'PAN Card', status: 'pending' },
      { name: 'Degree Certificate', status: 'pending' },
    ],
  },
  {
    id: 6, name: 'Ananya Krishnan', email: 'ananya.krishnan@gmail.com', location: 'Bangalore, Karnataka',
    submittedDate: '2024-04-07', status: 'Under Review', initials: 'AK', color: 'bg-cyan-500',
    phone: '+91 43210 98765',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'verified' },
      { name: 'Degree Certificate', status: 'pending' },
    ],
  },
  {
    id: 7, name: 'Prateek Joshi', email: 'prateek.joshi@hotmail.com', location: 'Jaipur, Rajasthan',
    submittedDate: '2024-04-06', status: 'Verified', initials: 'PJ', color: 'bg-caution',
    phone: '+91 32109 87654',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'verified' },
      { name: 'Degree Certificate', status: 'verified' },
    ],
  },
  {
    id: 8, name: 'Divya Nair', email: 'divya.nair@gmail.com', location: 'Kochi, Kerala',
    submittedDate: '2024-04-05', status: 'Pending', initials: 'DN', color: 'bg-pink-500',
    phone: '+91 21098 76543',
    documents: [
      { name: 'Aadhar Card', status: 'verified' },
      { name: 'PAN Card', status: 'missing' },
      { name: 'Degree Certificate', status: 'pending' },
    ],
  },
];

const stats = [
  { label: 'Pending Review', value: '23', icon: Clock, color: 'text-[#9A5D00]', bg: 'bg-caution-soft border-[#F3DBB4]' },
  { label: 'Verified Today', value: '45', icon: UserCheck, color: 'text-[#0A7A54]', bg: 'bg-positive-soft border-[#BEE7D8]' },
  { label: 'Rejected', value: '8', icon: XCircle, color: 'text-[#B32B2B]', bg: 'bg-critical-soft border-[#F3C9C9]' },
  { label: 'Total Verified', value: '1,247', icon: CheckCircle, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-100' },
];

const tabs: (VerificationStatus | 'All')[] = ['All', 'Pending', 'Under Review', 'Verified', 'Rejected'];

const statusBadge: Record<VerificationStatus, string> = {
  Pending: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
  'Under Review': 'bg-brand-50 text-brand-600 border border-brand-100',
  Verified: 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]',
  Rejected: 'bg-critical-soft text-[#B32B2B] border border-[#F3C9C9]',
};

const statusIcon: Record<VerificationStatus, React.ReactNode> = {
  Pending: <Clock className="w-3 h-3 mr-1" />,
  'Under Review': <AlertCircle className="w-3 h-3 mr-1" />,
  Verified: <CheckCircle className="w-3 h-3 mr-1" />,
  Rejected: <XCircle className="w-3 h-3 mr-1" />,
};

function DocBadge({ doc }: { doc: Document }) {
  const cfg: Record<DocStatus, { cls: string; icon: React.ReactNode; label: string }> = {
    verified: { cls: 'text-[#0A7A54]', icon: <CheckCircle className="w-3.5 h-3.5" />, label: doc.name },
    pending: { cls: 'text-[#9A5D00]', icon: <Clock className="w-3.5 h-3.5" />, label: doc.name },
    missing: { cls: 'text-ink-faint', icon: <XCircle className="w-3.5 h-3.5" />, label: doc.name },
  };
  const c = cfg[doc.status];
  return (
    <div className={`flex items-center gap-1.5 text-xs ${c.cls}`}>
      {c.icon}
      <span>{c.label}</span>
    </div>
  );
}

export default function CandidateVerificationPage() {
  const [activeTab, setActiveTab] = useState<VerificationStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = candidates.filter((c) => {
    const matchTab = activeTab === 'All' || c.status === activeTab;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCount = (tab: VerificationStatus | 'All') =>
    tab === 'All' ? candidates.length : candidates.filter((c) => c.status === tab).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Candidate Verification</h1>
          <p className="text-ink-muted text-sm mt-1">Review and verify candidate identity documents</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Export Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-line rounded-[16px] py-16 text-center text-ink-faint">
          No candidates found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((candidate) => (
            <div key={candidate.id} className="bg-white border border-line rounded-[16px] p-5 flex flex-col gap-4 hover:border-line transition-colors">
              {/* Top: Avatar + Info + Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${candidate.color} flex items-center justify-center text-ink font-bold text-sm flex-shrink-0`}>
                    {candidate.initials}
                  </div>
                  <div>
                    <p className="text-ink font-semibold text-sm leading-tight">{candidate.name}</p>
                    <p className="text-ink-muted text-xs mt-0.5">{candidate.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge[candidate.status]}`}>
                  {statusIcon[candidate.status]}{candidate.status}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-ink-muted text-xs">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {candidate.location}
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted text-xs">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  Submitted {new Date(candidate.submittedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white/60 rounded-lg p-3 space-y-2">
                <p className="text-ink-faint text-xs font-medium uppercase tracking-wide mb-2">Documents Submitted</p>
                {candidate.documents.map((doc) => (
                  <DocBadge key={doc.name} doc={doc} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-canvas hover:bg-line text-ink py-2 rounded-lg text-xs font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  Review Docs
                </button>
                {candidate.status !== 'Verified' && candidate.status !== 'Rejected' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-positive hover:bg-emerald-700 text-ink py-2 rounded-lg text-xs font-medium transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verify
                  </button>
                )}
                {candidate.status !== 'Rejected' && (
                  <button className="flex items-center justify-center gap-1.5 bg-critical-soft hover:bg-critical-soft text-[#B32B2B] border border-[#F3C9C9] py-2 px-3 rounded-lg text-xs font-medium transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
                {candidate.status === 'Rejected' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-caution-soft hover:bg-caution-soft text-[#9A5D00] border border-[#F3DBB4] py-2 rounded-lg text-xs font-medium transition-colors">
                    <Clock className="w-3.5 h-3.5" />
                    Re-queue
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
