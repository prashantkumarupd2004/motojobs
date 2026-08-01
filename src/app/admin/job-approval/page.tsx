'use client';

import { useState } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Tag,
  ChevronDown,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { JOB_CATEGORIES } from '@/lib/automotive';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Job {
  id: number;
  title: string;
  company: string;
  initials: string;
  accentColor: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  category: string;
  recruiterName: string;
  recruiterEmail: string;
  submittedAt: string;
  description: string;
  skills: string[];
  status: 'Pending' | 'Under Review';
}

interface ModalState {
  open: boolean;
  action: 'approve' | 'reject' | null;
  job: Job | null;
  reason: string;
}

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Service Advisor',
    company: 'Competent Automobiles (Maruti Suzuki Arena)',
    initials: 'CA',
    accentColor: 'bg-blue-500',
    location: 'Gurugram, Haryana',
    salaryMin: 2.4,
    salaryMax: 4.5,
    type: 'Full-time',
    category: 'Service & Workshop',
    recruiterName: 'Priya Sharma',
    recruiterEmail: 'priya.sharma@competentauto.in',
    submittedAt: '2026-06-11T08:30:00',
    description:
      'We are looking for a Service Advisor to handle customer reception at our Arena workshop. You will open job cards, explain estimates, coordinate with technicians on the floor, follow up on parts availability, and drive our CSI score. Prior experience at an authorised four-wheeler workshop is preferred.',
    skills: ['Customer Handling', 'DMS Software', 'Warranty Claim Processing', 'Service Upselling'],
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Automobile Technician',
    company: 'Landmark Cars',
    initials: 'LC',
    accentColor: 'bg-brand-500',
    location: 'Pune, Maharashtra',
    salaryMin: 1.6,
    salaryMax: 3.0,
    type: 'Full-time',
    category: 'Service & Workshop',
    recruiterName: 'Rohan Mehta',
    recruiterEmail: 'rohan.mehta@landmarkcars.in',
    submittedAt: '2026-06-11T09:15:00',
    description:
      'Join our multi-brand workshop as an Automobile Technician. You will carry out periodic maintenance services, diagnose engine and electrical faults using scan tools, and complete repairs to OEM standards. ITI MMV or Diploma in Automobile Engineering required, with 2+ years of hands-on bay experience.',
    skills: ['Engine Diagnostics', 'Brake System Servicing', 'BS6 Emission Norms', 'OBD Scanner Operation'],
    status: 'Under Review',
  },
  {
    id: 3,
    title: 'Sales Consultant',
    company: 'Hyundai Motor Plaza',
    initials: 'HM',
    accentColor: 'bg-sky-500',
    location: 'Chennai, Tamil Nadu',
    salaryMin: 1.8,
    salaryMax: 3.6,
    type: 'Full-time',
    category: 'Sales & Showroom',
    recruiterName: 'Ananya Iyer',
    recruiterEmail: 'ananya.iyer@hyundaiplaza.in',
    submittedAt: '2026-06-10T17:45:00',
    description:
      'Handle showroom walk-ins end to end — need analysis, product demonstration, test drives, finance coordination and delivery. You will own your monthly booking and retail targets and maintain follow-up discipline on every enquiry. Attractive incentive structure on top of fixed salary.',
    skills: ['Test Drive Handling', 'Showroom Walk-in Conversion', 'Vehicle Finance & Loan Processing', 'Negotiation Skills'],
    status: 'Pending',
  },
  {
    id: 4,
    title: 'EV Technician',
    company: 'Ather Energy Experience Centre',
    initials: 'AE',
    accentColor: 'bg-ignite-500',
    location: 'Bengaluru, Karnataka',
    salaryMin: 2.4,
    salaryMax: 4.8,
    type: 'Full-time',
    category: 'EV & New Energy',
    recruiterName: 'Kiran Rao',
    recruiterEmail: 'kiran.rao@atherenergy.in',
    submittedAt: '2026-06-10T14:20:00',
    description:
      'Service and diagnose electric two-wheelers at our experience centre. Responsibilities include battery pack health checks, motor and controller diagnostics, charging infrastructure support, and firmware updates. Strict adherence to high-voltage safety procedure is mandatory. EV training will be provided.',
    skills: ['EV Battery Systems', 'HV Safety Protocols', 'Battery Management System (BMS)', 'EV Motor & Controller Diagnostics'],
    status: 'Pending',
  },
  {
    id: 5,
    title: 'Body Shop Painter',
    company: 'Star Auto Body Works',
    initials: 'SA',
    accentColor: 'bg-orange-500',
    location: 'Ahmedabad, Gujarat',
    salaryMin: 2.1,
    salaryMax: 4.2,
    type: 'Full-time',
    category: 'Body Shop & Paint',
    recruiterName: 'Deepika Nair',
    recruiterEmail: 'deepika.nair@starautobody.in',
    submittedAt: '2026-06-11T07:00:00',
    description:
      'Carry out surface preparation, primer application, shade matching and final painting in our downdraft spray booth. You will work alongside denters on accident repair jobs and ensure finish quality matches OEM standards before polishing and delivery. 3+ years of body shop experience required.',
    skills: ['Denting & Painting', 'Spray Booth Operation', 'Estimation & Costing', 'Insurance Claim Handling'],
    status: 'Under Review',
  },
  {
    id: 6,
    title: 'Spare Parts Executive',
    company: 'Tata Motors Authorised Service',
    initials: 'TM',
    accentColor: 'bg-positive',
    location: 'Jamshedpur, Jharkhand',
    salaryMin: 1.8,
    salaryMax: 3.4,
    type: 'Full-time',
    category: 'Spare Parts',
    recruiterName: 'Sahil Gupta',
    recruiterEmail: 'sahil.gupta@tatamotorsservice.in',
    submittedAt: '2026-06-09T11:30:00',
    description:
      'Manage the parts counter and stores for our commercial vehicle workshop. You will identify parts against VIN, raise indents, maintain stock levels on fast-moving items, handle warranty part returns, and keep the parts fill rate above target. Working knowledge of DMS is essential.',
    skills: ['Spare Parts Inventory Control', 'DMS Software', 'Warranty Claim Processing', 'MS Excel'],
    status: 'Pending',
  },
  {
    id: 7,
    title: 'Service Trainee (Apprentice)',
    company: 'TVS Motor Authorised Dealer',
    initials: 'TV',
    accentColor: 'bg-pink-500',
    location: 'Hosur, Tamil Nadu',
    salaryMin: 1.2,
    salaryMax: 1.8,
    type: 'Internship',
    category: 'Service & Workshop',
    recruiterName: 'Preeti Agarwal',
    recruiterEmail: 'preeti.agarwal@tvsdealer.in',
    submittedAt: '2026-06-11T10:00:00',
    description:
      'Apprenticeship programme for fresh ITI graduates at our two-wheeler service centre. You will assist senior mechanics with periodic services, learn diagnostics on TVS models, and complete structured OEM training modules. Confirmed placement on successful completion of the 12-month programme.',
    skills: ['Two-Wheeler Servicing', 'Periodic Maintenance Service', '5S & Workshop Safety', 'Communication Skills'],
    status: 'Pending',
  },
  {
    id: 8,
    title: 'Workshop Manager',
    company: 'Mahindra First Choice',
    initials: 'MF',
    accentColor: 'bg-critical',
    location: 'Hyderabad, Telangana',
    salaryMin: 6.0,
    salaryMax: 11.0,
    type: 'Full-time',
    category: 'Dealership Management',
    recruiterName: 'Arjun Krishnan',
    recruiterEmail: 'arjun.krishnan@mahindrafirstchoice.in',
    submittedAt: '2026-06-10T16:00:00',
    description:
      'Run a 14-bay multi-brand workshop end to end. You will own throughput and labour hour productivity, manage a team of advisors and technicians, control parts consumption, resolve escalated customer complaints, and drive first-time-right and CSI targets. Diploma or B.E. Mechanical with 6+ years in workshop operations.',
    skills: ['Team Management', 'Repair Order (RO) Management', 'CSI / SSI Improvement', 'Complaint Resolution'],
    status: 'Under Review',
  },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const typeColors: Record<string, string> = {
  'Full-time': 'bg-brand-50 text-brand-700 border border-brand-100',
  'Part-time': 'bg-brand-50 text-sky-300 border border-brand-100',
  Contract: 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]',
  Internship: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
};

const formatSalary = (min: number, max: number) =>
  `â‚¹${min}L â€“ â‚¹${max}L / yr`;

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const categories = ['All', ...JOB_CATEGORIES.map(c => c.label)];
const types = ['All', 'Full-time', 'Part-time', 'Remote', 'Internship'];

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-ink-muted text-sm">{label}</p>
        <p className="text-ink text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// â”€â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ActionModal({
  modal,
  onClose,
  onConfirm,
}: {
  modal: ModalState;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!modal.open || !modal.job) return null;
  const isApprove = modal.action === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/35 backdrop-blur-sm">
      <div className="bg-white border border-line rounded-[20px] w-full max-w-lg mx-4 shadow-[0_16px_32px_rgba(16,24,40,0.07),0_40px_80px_rgba(16,24,40,0.10)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-line">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isApprove ? 'bg-positive-soft' : 'bg-critical-soft'
              }`}
            >
              {isApprove ? (
                <CheckCircle className="w-5 h-5 text-[#0A7A54]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#B32B2B]" />
              )}
            </div>
            <div>
              <h2 className="text-ink font-semibold text-lg">
                {isApprove ? 'Approve Job Posting' : 'Reject Job Posting'}
              </h2>
              <p className="text-ink-muted text-sm">{modal.job.title} Â· {modal.job.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors p-1 rounded-lg hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {isApprove ? (
            <div className="bg-positive-soft border border-[#BEE7D8] rounded-[16px] p-4">
              <p className="text-[#0A7A54] text-sm">
                This job will be published live and visible to all candidates on Motojobs.in. Please
                ensure it complies with platform policies before approving.
              </p>
            </div>
          ) : (
            <div className="bg-critical-soft border border-[#F3C9C9] rounded-[16px] p-4">
              <p className="text-[#B32B2B] text-sm">
                This job will be removed from the queue and the recruiter will be notified. Please
                provide a clear reason so they can resubmit with corrections.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm text-ink-soft font-medium mb-2">
              {isApprove ? 'Approval Note (optional)' : 'Rejection Reason *'}
            </label>
            <textarea
              rows={4}
              placeholder={
                isApprove
                  ? 'Add any internal note for this approvalâ€¦'
                  : 'e.g. Salary range not specified, misleading job titleâ€¦'
              }
              className="w-full bg-white border border-line rounded-[16px] px-4 py-3 text-ink placeholder-ink-faint text-sm resize-none focus:outline-none focus:border-line transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-line">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[16px] bg-white border border-line text-ink-soft hover:text-ink hover:bg-canvas transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-[16px] text-ink text-sm font-semibold transition-colors ${
              isApprove
                ? 'bg-positive hover:bg-positive'
                : 'bg-critical hover:bg-critical'
            }`}
          >
            {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Job Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function JobCard({
  job,
  onApprove,
  onReject,
  onPreview,
}: {
  job: Job;
  onApprove: (j: Job) => void;
  onReject: (j: Job) => void;
  onPreview: (j: Job) => void;
}) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5 hover:border-line transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Logo */}
          <div
            className={`w-11 h-11 rounded-lg ${job.accentColor} flex items-center justify-center flex-shrink-0 text-ink font-bold text-sm`}
          >
            {job.initials}
          </div>
          {/* Title block */}
          <div className="min-w-0">
            <h3 className="text-ink font-semibold text-base truncate">{job.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
              <span className="text-ink-muted text-sm truncate">{job.company}</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            job.status === 'Pending'
              ? 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]'
              : 'bg-brand-50 text-sky-300 border border-brand-100'
          }`}
        >
          {job.status === 'Pending' ? 'â— Pending' : 'â—Ž Under Review'}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <div className="flex items-center gap-1.5 text-ink-muted text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink-muted text-sm">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeColors[job.type]}`}>
          {job.type}
        </span>
        <span className="bg-canvas text-ink-soft text-xs px-2.5 py-0.5 rounded-full">
          {job.category}
        </span>
      </div>

      {/* Description preview */}
      <p className="text-ink-muted text-sm mt-3 leading-relaxed line-clamp-2">
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Tag className="w-3.5 h-3.5 text-ink-faint mt-0.5 flex-shrink-0" />
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="bg-canvas text-ink-soft text-xs px-2.5 py-0.5 rounded-md border border-line"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-line my-4" />

      {/* Footer row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Recruiter info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-canvas flex items-center justify-center text-ink-soft text-xs font-semibold">
            {job.recruiterName.charAt(0)}
          </div>
          <div>
            <p className="text-ink-soft text-xs font-medium">{job.recruiterName}</p>
            <p className="text-ink-faint text-xs">{job.recruiterEmail}</p>
          </div>
          <span className="mx-2 text-ink-faint">Â·</span>
          <Clock className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" />
          <span className="text-ink-faint text-xs">{formatDateTime(job.submittedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(job)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas hover:bg-line text-ink-soft hover:text-ink rounded-lg text-xs font-medium transition-colors border border-line"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => onApprove(job)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-positive-soft hover:bg-positive text-[#0A7A54] hover:text-ink rounded-lg text-xs font-medium transition-colors border border-emerald-600/40 hover:border-emerald-600"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => onReject(job)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-critical-soft hover:bg-[#C62E2E] text-[#B32B2B] hover:text-ink rounded-lg text-xs font-medium transition-colors border border-rose-600/40 hover:border-rose-600"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function JobApprovalPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modal, setModal] = useState<ModalState>({
    open: false,
    action: null,
    job: null,
    reason: '',
  });
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || j.category === categoryFilter;
    const matchType = typeFilter === 'All' || j.type === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const openModal = (action: 'approve' | 'reject', job: Job) =>
    setModal({ open: true, action, job, reason: '' });

  const closeModal = () => setModal({ open: false, action: null, job: null, reason: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirm = () => {
    if (!modal.job) return;
    if (modal.action === 'approve') {
      setJobs((prev) => prev.filter((j) => j.id !== modal.job!.id));
      showToast(`"${modal.job.title}" approved and published.`, 'success');
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== modal.job!.id));
      showToast(`"${modal.job.title}" rejected and recruiter notified.`, 'error');
    }
    closeModal();
  };

  const handlePreview = (job: Job) => {
    // In a real app, open a preview drawer
    alert(`Preview: ${job.title} at ${job.company}`);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-[16px] shadow-[0_8px_16px_rgba(16,24,40,0.05),0_24px_48px_rgba(16,24,40,0.08)] text-sm font-medium border ${
            toast.type === 'success'
              ? 'bg-positive-soft border-emerald-600/40 text-[#0A7A54]'
              : 'bg-critical-soft border-rose-600/40 text-[#B32B2B]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      <ActionModal modal={modal} onClose={closeModal} onConfirm={handleConfirm} />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Job Approval Queue</h1>
            <p className="text-ink-muted text-sm mt-1">
              Review and moderate job postings before they go live.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-caution-soft border border-[#F3DBB4] rounded-[16px] px-4 py-2">
            <AlertCircle className="w-4 h-4 text-[#9A5D00]" />
            <span className="text-[#9A5D00] text-sm font-medium">{jobs.length} jobs awaiting review</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5 text-[#9A5D00]" />}
            label="Pending Review"
            value={15}
            iconBg="bg-caution-soft"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-[#0A7A54]" />}
            label="Approved Today"
            value={34}
            iconBg="bg-positive-soft"
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-[#B32B2B]" />}
            label="Rejected"
            value={7}
            iconBg="bg-critical-soft"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-brand-600" />}
            label="Total Jobs Live"
            value="1,847"
            iconBg="bg-brand-50"
          />
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-line rounded-[16px] p-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or companyâ€¦"
              className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-line transition-colors"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-line rounded-lg pl-8 pr-8 py-2 text-sm text-ink-soft focus:outline-none focus:border-line cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
          </div>

          {/* Type */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-line rounded-lg pl-8 pr-8 py-2 text-sm text-ink-soft focus:outline-none focus:border-line cursor-pointer"
            >
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
          </div>

          {/* Reset */}
          {(search || categoryFilter !== 'All' || typeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setTypeFilter('All');
              }}
              className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          <span className="ml-auto text-ink-faint text-sm">{filtered.length} results</span>
        </div>

        {/* Job cards */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-line rounded-[16px] p-16 flex flex-col items-center gap-3">
            <Briefcase className="w-12 h-12 text-ink-faint" />
            <p className="text-ink-muted">No jobs match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApprove={(j) => openModal('approve', j)}
                onReject={(j) => openModal('reject', j)}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

