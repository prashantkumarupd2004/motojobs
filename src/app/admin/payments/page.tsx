'use client';

import { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  IndianRupee,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type Plan = 'Free' | 'Pro' | 'Enterprise';
type PaymentStatus = 'Active' | 'Expired' | 'Pending';

interface Payment {
  id: number;
  company: string;
  initials: string;
  plan: Plan;
  amount: number;
  billingDate: string;
  nextRenewal: string;
  status: PaymentStatus;
  invoiceId: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jan', revenue: 7.2 },
  { month: 'Feb', revenue: 8.5 },
  { month: 'Mar', revenue: 9.1 },
  { month: 'Apr', revenue: 10.4 },
  { month: 'May', revenue: 11.8 },
  { month: 'Jun', revenue: 12.4 },
];

const mockPayments: Payment[] = [
  {
    id: 1,
    company: 'Infosys Ltd.',
    initials: 'IL',
    plan: 'Enterprise',
    amount: 49999,
    billingDate: '2026-06-01',
    nextRenewal: '2026-07-01',
    status: 'Active',
    invoiceId: 'INV-2026-0601',
  },
  {
    id: 2,
    company: 'Razorpay',
    initials: 'RP',
    plan: 'Pro',
    amount: 9999,
    billingDate: '2026-06-03',
    nextRenewal: '2026-07-03',
    status: 'Active',
    invoiceId: 'INV-2026-0603',
  },
  {
    id: 3,
    company: 'Zepto',
    initials: 'ZP',
    plan: 'Pro',
    amount: 9999,
    billingDate: '2026-05-15',
    nextRenewal: '2026-06-15',
    status: 'Expired',
    invoiceId: 'INV-2026-0515',
  },
  {
    id: 4,
    company: 'boAt Lifestyle',
    initials: 'BL',
    plan: 'Free',
    amount: 0,
    billingDate: '2026-06-01',
    nextRenewal: '2026-07-01',
    status: 'Active',
    invoiceId: 'INV-2026-0601B',
  },
  {
    id: 5,
    company: 'Swiggy',
    initials: 'SW',
    plan: 'Enterprise',
    amount: 49999,
    billingDate: '2026-06-05',
    nextRenewal: '2026-07-05',
    status: 'Active',
    invoiceId: 'INV-2026-0605',
  },
  {
    id: 6,
    company: 'Ola Electric',
    initials: 'OE',
    plan: 'Pro',
    amount: 9999,
    billingDate: '2026-06-08',
    nextRenewal: '2026-07-08',
    status: 'Pending',
    invoiceId: 'INV-2026-0608',
  },
  {
    id: 7,
    company: 'HDFC Bank',
    initials: 'HB',
    plan: 'Enterprise',
    amount: 49999,
    billingDate: '2026-05-30',
    nextRenewal: '2026-06-30',
    status: 'Active',
    invoiceId: 'INV-2026-0530',
  },
  {
    id: 8,
    company: 'Zomato',
    initials: 'ZM',
    plan: 'Pro',
    amount: 9999,
    billingDate: '2026-06-02',
    nextRenewal: '2026-07-02',
    status: 'Active',
    invoiceId: 'INV-2026-0602',
  },
  {
    id: 9,
    company: 'PhonePe',
    initials: 'PP',
    plan: 'Enterprise',
    amount: 49999,
    billingDate: '2026-06-07',
    nextRenewal: '2026-07-07',
    status: 'Pending',
    invoiceId: 'INV-2026-0607',
  },
  {
    id: 10,
    company: 'Meesho',
    initials: 'MS',
    plan: 'Pro',
    amount: 9999,
    billingDate: '2026-05-20',
    nextRenewal: '2026-06-20',
    status: 'Expired',
    invoiceId: 'INV-2026-0520',
  },
  {
    id: 11,
    company: 'Nykaa',
    initials: 'NK',
    plan: 'Free',
    amount: 0,
    billingDate: '2026-06-01',
    nextRenewal: '2026-07-01',
    status: 'Active',
    invoiceId: 'INV-2026-0601C',
  },
  {
    id: 12,
    company: 'BYJU\'S',
    initials: 'BJ',
    plan: 'Pro',
    amount: 9999,
    billingDate: '2026-06-10',
    nextRenewal: '2026-07-10',
    status: 'Pending',
    invoiceId: 'INV-2026-0610',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const planConfig: Record<Plan, { badge: string; dot: string }> = {
  Free: {
    badge: 'bg-canvas text-ink-soft border border-line',
    dot: 'bg-ink-faint',
  },
  Pro: {
    badge: 'bg-brand-50 text-brand-700 border border-brand-100',
    dot: 'bg-brand-500',
  },
  Enterprise: {
    badge: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
    dot: 'bg-amber-400',
  },
};

const statusConfig: Record<PaymentStatus, { badge: string; icon: React.ReactNode }> = {
  Active: {
    badge: 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  Expired: {
    badge: 'bg-critical-soft text-[#B32B2B] border border-[#F3C9C9]',
    icon: <XCircle className="w-3 h-3" />,
  },
  Pending: {
    badge: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

const plans: (Plan | 'All')[] = ['All', 'Free', 'Pro', 'Enterprise'];
const statuses: (PaymentStatus | 'All')[] = ['All', 'Active', 'Expired', 'Pending'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatINR = (amount: number) =>
  amount === 0
    ? '₹0'
    : `₹${amount.toLocaleString('en-IN')}`;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-ink-muted text-sm">{label}</p>
        <p className="text-ink text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-ink-faint text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-[16px] px-4 py-3 shadow-[0_8px_16px_rgba(16,24,40,0.05),0_24px_48px_rgba(16,24,40,0.08)]">
      <p className="text-ink-muted text-xs mb-1">{label} 2026</p>
      <p className="text-ink font-bold text-base">₹{payload[0].value}L</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<Plan | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');

  const filtered = mockPayments.filter((p) => {
    const matchSearch = p.company.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'All' || p.plan === planFilter;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalRevenue = mockPayments
    .filter((p) => p.status === 'Active')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeCount = mockPayments.filter((p) => p.status === 'Active').length;
  const pendingCount = mockPayments.filter((p) => p.status === 'Pending').length;
  const expiredCount = mockPayments.filter((p) => p.status === 'Expired').length;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Payments & Subscriptions</h1>
            <p className="text-ink-muted text-sm mt-1">
              Monitor revenue, manage plans, and track billing status.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-[16px] text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<IndianRupee className="w-5 h-5 text-brand-600" />}
            label="Total Revenue"
            value="₹12.4L"
            sub="This month"
            iconBg="bg-brand-50"
          />
          <StatCard
            icon={<CreditCard className="w-5 h-5 text-[#0A7A54]" />}
            label="Active Subscriptions"
            value={String(287)}
            sub={`${activeCount} in current view`}
            iconBg="bg-positive-soft"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5 text-[#9A5D00]" />}
            label="Pending Payments"
            value={String(12)}
            sub={`${pendingCount} in current view`}
            iconBg="bg-caution-soft"
          />
          <StatCard
            icon={<RefreshCw className="w-5 h-5 text-[#B32B2B]" />}
            label="Refunds"
            value={String(3)}
            sub="This month"
            iconBg="bg-critical-soft"
          />
        </div>

        {/* Chart */}
        <div className="bg-white border border-line rounded-[16px] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-ink font-semibold">Revenue Overview</h2>
              <p className="text-ink-muted text-sm mt-0.5">Monthly revenue (Jan – Jun 2026)</p>
            </div>
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span className="text-brand-700 text-sm font-medium">+18.4% vs last month</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F4C81" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0F4C81" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9AA1AE', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9AA1AE', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}L`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0F4C81"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ fill: '#0F4C81', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#4A7FB4' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-line rounded-[16px] p-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company…"
              className="w-full bg-white border border-line rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-line transition-colors"
            />
          </div>

          {/* Plan filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as Plan | 'All')}
              className="appearance-none bg-white border border-line rounded-lg pl-8 pr-8 py-2 text-sm text-ink-soft focus:outline-none focus:border-line cursor-pointer"
            >
              {plans.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'All')}
              className="appearance-none bg-white border border-line rounded-lg pl-8 pr-8 py-2 text-sm text-ink-soft focus:outline-none focus:border-line cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
          </div>

          {/* Reset */}
          {(search || planFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setPlanFilter('All');
                setStatusFilter('All');
              }}
              className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          <span className="ml-auto text-ink-faint text-sm">{filtered.length} records</span>
        </div>

        {/* Table */}
        <div className="bg-white border border-line rounded-[16px] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-7 px-5 py-3 bg-white/60 border-b border-line">
            {['Company', 'Plan', 'Amount', 'Billing Date', 'Next Renewal', 'Status', 'Invoice'].map(
              (h) => (
                <span key={h} className="text-ink-muted text-xs font-semibold uppercase tracking-wide">
                  {h}
                </span>
              ),
            )}
          </div>

          {/* Rows */}
          <div className="divide-y divide-line-soft">
            {filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <CreditCard className="w-10 h-10 text-ink-faint" />
                <p className="text-ink-muted text-sm">No payment records match your filters.</p>
              </div>
            ) : (
              filtered.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-7 px-5 py-4 items-center hover:bg-canvas transition-colors"
                >
                  {/* Company */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center text-xs font-bold text-ink flex-shrink-0">
                      {payment.initials}
                    </div>
                    <span className="text-ink text-sm font-medium truncate">{payment.company}</span>
                  </div>

                  {/* Plan */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${planConfig[payment.plan].badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${planConfig[payment.plan].dot}`}
                      />
                      {payment.plan}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="text-ink text-sm font-semibold">
                    {payment.amount === 0 ? (
                      <span className="text-ink-faint">Free</span>
                    ) : (
                      formatINR(payment.amount)
                    )}
                  </div>

                  {/* Billing Date */}
                  <div className="text-ink-muted text-sm">{formatDate(payment.billingDate)}</div>

                  {/* Next Renewal */}
                  <div className="text-ink-muted text-sm">{formatDate(payment.nextRenewal)}</div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[payment.status].badge}`}
                    >
                      {statusConfig[payment.status].icon}
                      {payment.status}
                    </span>
                  </div>

                  {/* Invoice */}
                  <div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas hover:bg-line text-ink-soft hover:text-ink rounded-lg text-xs font-medium transition-colors border border-line">
                      <Download className="w-3 h-3" />
                      {payment.invoiceId}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-line bg-white/40 flex items-center justify-between">
              <span className="text-ink-faint text-xs">
                Showing {filtered.length} of {mockPayments.length} records
              </span>
              <div className="flex items-center gap-2">
                <span className="text-ink-faint text-xs">Total collected:</span>
                <span className="text-ink text-sm font-bold">
                  {formatINR(
                    filtered
                      .filter((p) => p.status === 'Active')
                      .reduce((s, p) => s + p.amount, 0),
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Plan breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {(['Free', 'Pro', 'Enterprise'] as Plan[]).map((plan) => {
            const count = mockPayments.filter((p) => p.plan === plan).length;
            const rev = mockPayments
              .filter((p) => p.plan === plan && p.status === 'Active')
              .reduce((s, p) => s + p.amount, 0);
            return (
              <div key={plan} className="bg-white border border-line rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planConfig[plan].badge}`}
                  >
                    {plan}
                  </span>
                  <span className="text-ink-muted text-xs">{count} companies</span>
                </div>
                <p className="text-ink text-xl font-bold">{formatINR(rev)}</p>
                <p className="text-ink-faint text-xs mt-1">Active revenue</p>
                <div className="mt-3 h-1.5 bg-canvas rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      plan === 'Free'
                        ? 'bg-ink-faint'
                        : plan === 'Pro'
                        ? 'bg-brand-500'
                        : 'bg-caution'
                    }`}
                    style={{ width: `${Math.round((count / mockPayments.length) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
