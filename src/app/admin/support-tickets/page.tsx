'use client';

import { useState } from 'react';
import {
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Send,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  XCircle,
  RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'High' | 'Medium' | 'Low';
type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
type Category = 'Technical' | 'Billing' | 'Account' | 'Other';
type UserRole = 'Candidate' | 'Recruiter';

interface Ticket {
  id: string;
  title: string;
  description: string;
  user: string;
  userRole: UserRole;
  userEmail: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  created: string;
  lastUpdated: string;
  assignedAgent: string;
  replies: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TB-1234',
    title: 'Unable to upload resume — PDF format rejected',
    description:
      'I have been trying to upload my resume in PDF format but the platform keeps showing "Invalid file format" even though it is a valid PDF under 5 MB. I have tried multiple browsers (Chrome, Firefox) and different PDF files but the issue persists. This is blocking my applications.',
    user: 'Priya Sharma',
    userRole: 'Candidate',
    userEmail: 'priya.sharma@gmail.com',
    category: 'Technical',
    priority: 'High',
    status: 'Open',
    created: '2026-06-11 10:24 AM',
    lastUpdated: '2026-06-11 10:24 AM',
    assignedAgent: 'Amit Verma',
    replies: 0,
  },
  {
    id: 'TB-1233',
    title: 'Job posting not appearing in search results',
    description:
      'We posted a "Senior Software Engineer" role 3 days ago and it is approved on our dashboard but does not appear in candidate search results. We are on the Enterprise plan and this is a priority hire for our team.',
    user: 'Rajesh Kumar',
    userRole: 'Recruiter',
    userEmail: 'rajesh.kumar@infosys.com',
    category: 'Technical',
    priority: 'High',
    status: 'In Progress',
    created: '2026-06-10 03:15 PM',
    lastUpdated: '2026-06-11 09:00 AM',
    assignedAgent: 'Sneha Patel',
    replies: 2,
  },
  {
    id: 'TB-1232',
    title: 'Incorrect billing charge on June invoice',
    description:
      'Our June invoice shows a charge of ₹49,999 for the Enterprise Annual plan, however we were quoted ₹44,999 during our renewal discussion with the sales team. Please review the invoice and issue a corrected one with the agreed price.',
    user: 'Ananya Desai',
    userRole: 'Recruiter',
    userEmail: 'finance@wiprotalent.com',
    category: 'Billing',
    priority: 'High',
    status: 'Open',
    created: '2026-06-10 11:40 AM',
    lastUpdated: '2026-06-10 11:40 AM',
    assignedAgent: 'Unassigned',
    replies: 0,
  },
  {
    id: 'TB-1231',
    title: 'Two-factor authentication not sending OTP',
    description:
      'Since yesterday I have not been receiving OTPs on my registered mobile number (+91-98XXXXXXXX) for 2FA login. I have verified the number is correct. This is preventing me from accessing my account to check application statuses.',
    user: 'Karan Mehta',
    userRole: 'Candidate',
    userEmail: 'karan.mehta@outlook.com',
    category: 'Account',
    priority: 'Medium',
    status: 'In Progress',
    created: '2026-06-10 08:30 AM',
    lastUpdated: '2026-06-11 08:15 AM',
    assignedAgent: 'Amit Verma',
    replies: 3,
  },
  {
    id: 'TB-1230',
    title: 'Candidate profile visibility settings not saving',
    description:
      'I set my profile to "Visible to Recruiters Only" but every time I re-login the setting reverts to "Public". This is a privacy concern as I do not want my current employer to see I am job searching.',
    user: 'Meena Iyer',
    userRole: 'Candidate',
    userEmail: 'meena.iyer@yahoo.com',
    category: 'Account',
    priority: 'Medium',
    status: 'Open',
    created: '2026-06-09 04:50 PM',
    lastUpdated: '2026-06-09 04:50 PM',
    assignedAgent: 'Sneha Patel',
    replies: 1,
  },
  {
    id: 'TB-1229',
    title: 'How to bulk export candidate applications?',
    description:
      'We need to export all applications for our "Product Manager" job posting to share with our hiring committee. The individual download option is too slow for 300+ applications. Is there a bulk CSV export feature available on the Pro plan?',
    user: 'Vikram Singh',
    userRole: 'Recruiter',
    userEmail: 'vikram.singh@flipkart.com',
    category: 'Other',
    priority: 'Low',
    status: 'Resolved',
    created: '2026-06-09 01:20 PM',
    lastUpdated: '2026-06-10 10:00 AM',
    assignedAgent: 'Rohit Joshi',
    replies: 4,
  },
  {
    id: 'TB-1228',
    title: 'Application status stuck at "Under Review" for 3 weeks',
    description:
      'I applied to "Data Scientist at TCS Global" on May 20th and the status has been "Under Review" for 3 weeks. I have not received any communication. Is there a way to know if my application was actually reviewed or if there is a system issue?',
    user: 'Divya Nair',
    userRole: 'Candidate',
    userEmail: 'divya.nair@gmail.com',
    category: 'Technical',
    priority: 'Medium',
    status: 'Resolved',
    created: '2026-06-08 09:10 AM',
    lastUpdated: '2026-06-10 02:30 PM',
    assignedAgent: 'Rohit Joshi',
    replies: 5,
  },
  {
    id: 'TB-1227',
    title: 'Request refund for annual subscription — company closure',
    description:
      'Our company (StartupXYZ Pvt Ltd) is unfortunately shutting down operations. We signed up for the Annual Pro plan on June 1st and need to request a pro-rated refund for the remaining 11 months. Please guide us through the refund process.',
    user: 'Suresh Reddy',
    userRole: 'Recruiter',
    userEmail: 'suresh@startupxyz.in',
    category: 'Billing',
    priority: 'High',
    status: 'Open',
    created: '2026-06-08 06:45 PM',
    lastUpdated: '2026-06-08 06:45 PM',
    assignedAgent: 'Unassigned',
    replies: 0,
  },
  {
    id: 'TB-1226',
    title: 'Recruiter dashboard showing wrong analytics data',
    description:
      'Our recruiter dashboard shows 0 views on all job postings for the past week, but we are clearly receiving applications. The "Applications Received" counter is updating correctly but the "Views" and "Click-through Rate" metrics appear frozen at 0.',
    user: 'Nisha Agarwal',
    userRole: 'Recruiter',
    userEmail: 'nisha.agarwal@hcl.com',
    category: 'Technical',
    priority: 'Medium',
    status: 'In Progress',
    created: '2026-06-07 11:30 AM',
    lastUpdated: '2026-06-11 07:45 AM',
    assignedAgent: 'Amit Verma',
    replies: 6,
  },
  {
    id: 'TB-1225',
    title: 'Email notifications not received for new job matches',
    description:
      'I set up job alerts for "Frontend Developer" positions in Bangalore but have not received any email notifications despite new matching jobs being posted. My email preferences are enabled and the emails are not in spam.',
    user: 'Arjun Bose',
    userRole: 'Candidate',
    userEmail: 'arjun.bose@hotmail.com',
    category: 'Technical',
    priority: 'Low',
    status: 'Closed',
    created: '2026-06-06 03:00 PM',
    lastUpdated: '2026-06-09 05:00 PM',
    assignedAgent: 'Sneha Patel',
    replies: 7,
  },
  {
    id: 'TB-1224',
    title: 'Cannot add team members to recruiter account',
    description:
      'According to our Enterprise plan, we should be able to add up to 10 team members. When I go to Settings > Team, the "Invite Member" button is greyed out and clicking it does nothing. We urgently need to onboard 3 new recruiters.',
    user: 'Pooja Verma',
    userRole: 'Recruiter',
    userEmail: 'pooja.verma@accenture.com',
    category: 'Account',
    priority: 'Medium',
    status: 'Resolved',
    created: '2026-06-05 02:15 PM',
    lastUpdated: '2026-06-07 11:00 AM',
    assignedAgent: 'Rohit Joshi',
    replies: 3,
  },
  {
    id: 'TB-1223',
    title: 'Request to change registered email address',
    description:
      'I would like to change my registered email from my old company address (rahul@oldcompany.com) to my personal email. The self-service option in settings requires verification via the old email which I no longer have access to.',
    user: 'Rahul Gupta',
    userRole: 'Candidate',
    userEmail: 'rahul@oldcompany.com',
    category: 'Account',
    priority: 'Low',
    status: 'Closed',
    created: '2026-06-04 10:00 AM',
    lastUpdated: '2026-06-06 02:30 PM',
    assignedAgent: 'Rohit Joshi',
    replies: 4,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; dot: string }> = {
  High: { label: 'High', className: 'bg-rose-900/50 text-[#B32B2B] border border-rose-700/50', dot: 'bg-rose-400' },
  Medium: { label: 'Medium', className: 'bg-amber-900/50 text-[#9A5D00] border border-amber-700/50', dot: 'bg-amber-400' },
  Low: { label: 'Low', className: 'bg-canvas text-ink-soft border border-line', dot: 'bg-ink-faint' },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string; icon: React.ElementType }> = {
  Open: { label: 'Open', className: 'bg-blue-900/50 text-brand-700 border border-blue-700/50', icon: AlertCircle },
  'In Progress': { label: 'In Progress', className: 'bg-amber-900/50 text-[#9A5D00] border border-amber-700/50', icon: RefreshCw },
  Resolved: { label: 'Resolved', className: 'bg-emerald-900/50 text-[#0A7A54] border border-emerald-700/50', icon: CheckCircle },
  Closed: { label: 'Closed', className: 'bg-canvas text-ink-muted border border-line', icon: XCircle },
};

const ROLE_CONFIG: Record<UserRole, string> = {
  Candidate: 'bg-brand-50 text-brand-700 border border-brand-100',
  Recruiter: 'bg-blue-900/50 text-brand-700 border border-blue-700/50',
};

const CATEGORY_ICONS: Record<Category, string> = {
  Technical: '⚙️',
  Billing: '💳',
  Account: '👤',
  Other: '💬',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 ${bgColor}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-ink-muted text-xs font-medium">{label}</p>
        <p className="text-ink text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sentReplies, setSentReplies] = useState<Record<string, boolean>>({});

  // Derived stats
  const openCount = MOCK_TICKETS.filter((t) => t.status === 'Open').length;
  const inProgressCount = MOCK_TICKETS.filter((t) => t.status === 'In Progress').length;
  const resolvedTodayCount = MOCK_TICKETS.filter((t) => t.status === 'Resolved').length;

  // Filtered tickets
  const filtered = MOCK_TICKETS.filter((ticket) => {
    const matchSearch =
      !search ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    const matchCategory = categoryFilter === 'All' || ticket.category === categoryFilter;
    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  function handleSendReply(ticketId: string) {
    if (!replyText[ticketId]?.trim()) return;
    setSentReplies((prev) => ({ ...prev, [ticketId]: true }));
    setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    setTimeout(() => setSentReplies((prev) => ({ ...prev, [ticketId]: false })), 3000);
  }

  function toggleExpand(ticketId: string) {
    setExpandedTicket((prev) => (prev === ticketId ? null : ticketId));
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Support Tickets</h1>
        <p className="text-ink-muted text-sm mt-1">Manage and respond to user support requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertCircle} label="Open Tickets" value={openCount} iconColor="text-brand-600" bgColor="bg-blue-900/30" />
        <StatCard icon={RefreshCw} label="In Progress" value={inProgressCount} iconColor="text-[#9A5D00]" bgColor="bg-amber-900/30" />
        <StatCard icon={CheckCircle} label="Resolved Today" value={resolvedTodayCount} iconColor="text-[#0A7A54]" bgColor="bg-emerald-900/30" />
        <StatCard icon={Clock} label="Avg Response Time" value="2.4 hrs" iconColor="text-brand-600" bgColor="bg-brand-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-line rounded-[16px] p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search tickets, IDs, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-brand-300"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-ink-faint" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'All')}
            className="bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')}
          className="bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300 cursor-pointer"
        >
          <option value="All">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
          className="bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand-300 cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Billing">Billing</option>
          <option value="Account">Account</option>
          <option value="Other">Other</option>
        </select>

        {/* Result count */}
        <span className="text-ink-faint text-xs ml-auto">
          {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-line rounded-[16px] p-10 text-center">
            <MessageSquare className="w-8 h-8 text-ink-faint mx-auto mb-3" />
            <p className="text-ink-muted text-sm">No tickets match your filters.</p>
          </div>
        )}

        {filtered.map((ticket) => {
          const isExpanded = expandedTicket === ticket.id;
          const priority = PRIORITY_CONFIG[ticket.priority];
          const status = STATUS_CONFIG[ticket.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={ticket.id}
              className="bg-white border border-line rounded-[16px] overflow-hidden transition-all"
            >
              {/* Ticket Header Row */}
              <div
                className="p-5 cursor-pointer hover:bg-canvas transition-colors"
                onClick={() => toggleExpand(ticket.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Left: ID + Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-brand-600 font-mono text-xs font-bold bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                      <span className="text-ink-faint text-xs">
                        {CATEGORY_ICONS[ticket.category]} {ticket.category}
                      </span>
                    </div>

                    <h3 className="text-ink font-semibold text-sm leading-snug mb-2 line-clamp-1">
                      {ticket.title}
                    </h3>

                    <p className="text-ink-muted text-xs leading-relaxed line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Right: Meta */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 text-right min-w-40">
                    {/* User */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-line flex items-center justify-center">
                        <User className="w-3 h-3 text-ink-soft" />
                      </div>
                      <div className="text-right">
                        <p className="text-ink text-xs font-medium">{ticket.user}</p>
                        <span className={`inline-flex text-xs px-1.5 py-0 rounded-full ${ROLE_CONFIG[ticket.userRole]}`}>
                          {ticket.userRole}
                        </span>
                      </div>
                    </div>

                    {/* Assigned */}
                    <div className="flex items-center gap-1 text-xs text-ink-faint">
                      <Tag className="w-3 h-3" />
                      <span>{ticket.assignedAgent}</span>
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-ink-faint space-y-0.5">
                      <p>Created: {ticket.created}</p>
                      <p>Updated: {ticket.lastUpdated}</p>
                    </div>

                    {/* Replies */}
                    <div className="flex items-center gap-1 text-xs text-ink-faint">
                      <MessageSquare className="w-3 h-3" />
                      <span>{ticket.replies} {ticket.replies === 1 ? 'reply' : 'replies'}</span>
                    </div>

                    {/* Expand icon */}
                    <div className="text-ink-faint">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Panel */}
              {isExpanded && (
                <div className="border-t border-line bg-white/50">
                  {/* Full Description */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-brand-600" />
                      <h4 className="text-ink text-sm font-semibold">Full Description</h4>
                    </div>
                    <div className="bg-white border border-line rounded-lg p-4">
                      <p className="text-ink-soft text-sm leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* User Info Row */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white border border-line rounded-lg p-3">
                        <p className="text-ink-faint text-xs mb-1">User Name</p>
                        <p className="text-ink text-sm font-medium">{ticket.user}</p>
                      </div>
                      <div className="bg-white border border-line rounded-lg p-3">
                        <p className="text-ink-faint text-xs mb-1">Email</p>
                        <p className="text-brand-700 text-sm">{ticket.userEmail}</p>
                      </div>
                      <div className="bg-white border border-line rounded-lg p-3">
                        <p className="text-ink-faint text-xs mb-1">Role</p>
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_CONFIG[ticket.userRole]}`}>
                          {ticket.userRole}
                        </span>
                      </div>
                      <div className="bg-white border border-line rounded-lg p-3">
                        <p className="text-ink-faint text-xs mb-1">Assigned To</p>
                        <p className="text-ink text-sm font-medium">{ticket.assignedAgent}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reply Box */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Send className="w-4 h-4 text-brand-600" />
                      <h4 className="text-ink text-sm font-semibold">Send Reply</h4>
                    </div>
                    <textarea
                      rows={4}
                      value={replyText[ticket.id] ?? ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      placeholder="Type your reply to the user..."
                      className="w-full bg-white border border-line rounded-lg px-4 py-3 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-brand-300 resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <select className="bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand-300">
                          <option value="">Change Status...</option>
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <select className="bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand-300">
                          <option value="">Assign Agent...</option>
                          <option value="Amit Verma">Amit Verma</option>
                          <option value="Sneha Patel">Sneha Patel</option>
                          <option value="Rohit Joshi">Rohit Joshi</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleSendReply(ticket.id)}
                        disabled={!replyText[ticket.id]?.trim()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          sentReplies[ticket.id]
                            ? 'bg-positive text-white'
                            : replyText[ticket.id]?.trim()
                            ? 'bg-brand-600 hover:bg-brand-700 text-white'
                            : 'bg-canvas text-ink-faint cursor-not-allowed'
                        }`}
                      >
                        {sentReplies[ticket.id] ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Reply Sent!
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
