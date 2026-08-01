'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Briefcase,
  BarChart2,
  MapPin,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const userGrowthData = [
  { month: 'Jan', candidates: 320, recruiters: 45 },
  { month: 'Feb', candidates: 410, recruiters: 58 },
  { month: 'Mar', candidates: 498, recruiters: 72 },
  { month: 'Apr', candidates: 540, recruiters: 80 },
  { month: 'May', candidates: 612, recruiters: 91 },
  { month: 'Jun', candidates: 688, recruiters: 104 },
  { month: 'Jul', candidates: 720, recruiters: 118 },
  { month: 'Aug', candidates: 801, recruiters: 130 },
  { month: 'Sep', candidates: 854, recruiters: 143 },
  { month: 'Oct', candidates: 912, recruiters: 160 },
  { month: 'Nov', candidates: 975, recruiters: 178 },
  { month: 'Dec', candidates: 1048, recruiters: 197 },
];

const applicationTrendData = [
  { month: 'Jan', applications: 1240, placements: 398 },
  { month: 'Feb', applications: 1580, placements: 512 },
  { month: 'Mar', applications: 1890, placements: 634 },
  { month: 'Apr', applications: 2100, placements: 710 },
  { month: 'May', applications: 2350, placements: 798 },
  { month: 'Jun', applications: 2620, placements: 891 },
  { month: 'Jul', applications: 2480, placements: 862 },
  { month: 'Aug', applications: 2780, placements: 944 },
  { month: 'Sep', applications: 2910, placements: 989 },
  { month: 'Oct', applications: 3120, placements: 1061 },
  { month: 'Nov', applications: 3340, placements: 1136 },
  { month: 'Dec', applications: 3481, placements: 1183 },
];

const jobCategoryData = [
  { name: 'Service & Workshop', value: 38, color: '#0F4C81' },
  { name: 'Sales & Showroom', value: 27, color: '#1F5D95' },
  { name: 'Spare Parts', value: 14, color: '#FF6B00' },
  { name: 'Body Shop', value: 11, color: '#9AA1AE' },
  { name: 'EV & New Energy', value: 10, color: '#f472b6' },
];

const jobCategoryBarData = [
  { category: 'Service & Workshop', jobs: 702 },
  { category: 'Sales & Showroom', jobs: 499 },
  { category: 'Spare Parts', jobs: 259 },
  { category: 'Body Shop', jobs: 203 },
  { category: 'EV & New Energy', jobs: 184 },
];

const geoData = [
  { rank: 1, city: 'Pune', state: 'Maharashtra', jobs: 423, growth: '+12%', trend: 'up' },
  { rank: 2, city: 'Chennai', state: 'Tamil Nadu', jobs: 387, growth: '+18%', trend: 'up' },
  { rank: 3, city: 'Gurugram', state: 'Haryana', jobs: 298, growth: '+7%', trend: 'up' },
  { rank: 4, city: 'Bengaluru', state: 'Karnataka', jobs: 234, growth: '+9%', trend: 'up' },
  { rank: 5, city: 'Ahmedabad', state: 'Gujarat', jobs: 189, growth: '-3%', trend: 'down' },
];

const topCompanies = [
  { company: 'Competent Automobiles', logo: 'CA', jobsPosted: 87, applications: 3421, hireRate: '38%', plan: 'Enterprise', planColor: 'indigo' },
  { company: 'Landmark Cars', logo: 'LC', jobsPosted: 73, applications: 2910, hireRate: '41%', plan: 'Enterprise', planColor: 'indigo' },
  { company: 'Hyundai Motor Plaza', logo: 'HM', jobsPosted: 62, applications: 2340, hireRate: '35%', plan: 'Pro', planColor: 'blue' },
  { company: 'Tata Motors Service', logo: 'TM', jobsPosted: 54, applications: 2100, hireRate: '29%', plan: 'Pro', planColor: 'blue' },
  { company: 'Mahindra First Choice', logo: 'MF', jobsPosted: 49, applications: 1870, hireRate: '44%', plan: 'Enterprise', planColor: 'indigo' },
  { company: 'TVS Motor Dealer', logo: 'TV', jobsPosted: 41, applications: 1640, hireRate: '32%', plan: 'Pro', planColor: 'blue' },
  { company: 'Ather Energy', logo: 'AE', jobsPosted: 28, applications: 1120, hireRate: '28%', plan: 'Starter', planColor: 'slate' },
];

const recentActivity = [
  { id: 1, type: 'user_registered', icon: '👤', text: 'Priya Sharma registered as a Candidate', time: '2 min ago', color: 'indigo' },
  { id: 2, type: 'job_posted', icon: '💼', text: 'Competent Automobiles posted "Service Advisor" in Gurugram', time: '8 min ago', color: 'blue' },
  { id: 3, type: 'application', icon: '📄', text: 'Rohan Mehta applied to "Automobile Technician @ Landmark Cars"', time: '15 min ago', color: 'purple' },
  { id: 4, type: 'hired', icon: '🎉', text: 'Ananya Gupta was hired by Hyundai Motor Plaza', time: '32 min ago', color: 'emerald' },
  { id: 5, type: 'user_registered', icon: '👤', text: 'Karan Patel registered as a Recruiter', time: '45 min ago', color: 'indigo' },
  { id: 6, type: 'job_posted', icon: '💼', text: 'Ather Energy posted "EV Technician" in Bengaluru', time: '1 hr ago', color: 'blue' },
  { id: 7, type: 'application', icon: '📄', text: 'Meena Iyer applied to "Telecaller / CRE @ TVS Motor Dealer"', time: '1.2 hr ago', color: 'purple' },
  { id: 8, type: 'plan_upgrade', icon: '⬆️', text: 'Tata Motors Service upgraded to Enterprise Plan', time: '2 hr ago', color: 'amber' },
  { id: 9, type: 'job_posted', icon: '💼', text: 'Mahindra First Choice posted "Workshop Manager" in Hyderabad', time: '3 hr ago', color: 'blue' },
  { id: 10, type: 'hired', icon: '🎉', text: 'Vikram Singh was hired by Star Auto Body Works', time: '4 hr ago', color: 'emerald' },
];

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8EAF0',
    borderRadius: '14px',
    color: '#1A1A1A',
    boxShadow: '0 8px 24px rgba(16,24,40,0.08)',
    fontSize: 13,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  change,
  changeType,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-ink-muted text-sm font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4 text-ink" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        {sub && <p className="text-xs text-ink-muted mt-0.5">{sub}</p>}
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-[#0A7A54]' : changeType === 'down' ? 'text-[#B32B2B]' : 'text-ink-muted'}`}>
          {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : changeType === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
          {change}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-[16px] p-5">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-brand-600" />
        <h2 className="text-ink font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Platform Analytics</h1>
          <p className="text-ink-muted text-sm mt-1">Real-time insights across the Motojobs.in ecosystem</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white border border-line rounded-[16px] p-1">
          <Calendar className="w-4 h-4 text-ink-muted ml-2" />
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                dateRange === range
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={Users}
          label="Total Users"
          value="5,234"
          sub="All time registered"
          change="+8.2% this month"
          changeType="up"
          iconBg="bg-brand-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="New This Month"
          value="423"
          sub="Candidates + Recruiters"
          change="+15.4% vs last month"
          changeType="up"
          iconBg="bg-ignite-600"
        />
        <MetricCard
          icon={Briefcase}
          label="Total Jobs"
          value="1,847"
          sub="Active listings"
          change="+6.1% this month"
          changeType="up"
          iconBg="bg-brand-600"
        />
        <MetricCard
          icon={BarChart2}
          label="Applications"
          value="23,891"
          sub="Total submitted"
          change="+11.3% this month"
          changeType="up"
          iconBg="bg-cyan-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="Placement Rate"
          value="34%"
          sub="Hired / Applications"
          change="+2.1% vs last period"
          changeType="up"
          iconBg="bg-positive"
        />
        <MetricCard
          icon={Clock}
          label="Avg Time to Hire"
          value="18 days"
          sub="From posting to hire"
          change="-1.5 days improved"
          changeType="up"
          iconBg="bg-critical"
        />
      </div>

      {/* Row 2: User Growth + Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <SectionCard title="User Growth — Candidates vs Recruiters" icon={Users}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userGrowthData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
              <XAxis dataKey="month" tick={{ fill: '#9AA1AE', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9AA1AE', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Line type="monotone" dataKey="candidates" stroke="#0F4C81" strokeWidth={2.5} dot={false} name="Candidates" />
              <Line type="monotone" dataKey="recruiters" stroke="#1F5D95" strokeWidth={2.5} dot={false} name="Recruiters" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Application Trend */}
        <SectionCard title="Applications & Placements Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={applicationTrendData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E9F6E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0E9F6E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
              <XAxis dataKey="month" tick={{ fill: '#9AA1AE', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9AA1AE', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="applications" stroke="#0F4C81" fill="url(#colorApplications)" strokeWidth={2} name="Applications" />
              <Area type="monotone" dataKey="placements" stroke="#0E9F6E" fill="url(#colorPlacements)" strokeWidth={2} name="Placements" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Row 3: Job Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <SectionCard title="Job Category Distribution" icon={BarChart2}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={jobCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {jobCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(value: any) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {jobCategoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-ink-soft text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-canvas rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="text-ink text-sm font-medium w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Bar Chart */}
        <SectionCard title="Jobs by Category (Count)" icon={BarChart2}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={jobCategoryBarData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: '#9AA1AE', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9AA1AE', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="jobs" name="Jobs" radius={[4, 4, 0, 0]}>
                {jobCategoryBarData.map((_, index) => (
                  <Cell key={`bar-${index}`} fill={jobCategoryData[index]?.color ?? '#0F4C81'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Row 4: Geographic + Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <SectionCard title="Geographic Distribution — Top Cities" icon={MapPin}>
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs text-ink-faint font-medium px-2 pb-2 border-b border-line">
              <span className="col-span-1">#</span>
              <span className="col-span-4">City</span>
              <span className="col-span-3">State</span>
              <span className="col-span-2 text-right">Jobs</span>
              <span className="col-span-2 text-right">Growth</span>
            </div>
            {geoData.map((row) => (
              <div
                key={row.rank}
                className="grid grid-cols-12 items-center px-2 py-3 rounded-lg hover:bg-canvas transition-colors"
              >
                <span className="col-span-1 text-ink-faint text-sm font-bold">{row.rank}</span>
                <div className="col-span-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                  <span className="text-ink text-sm font-medium">{row.city}</span>
                </div>
                <span className="col-span-3 text-ink-muted text-sm">{row.state}</span>
                <span className="col-span-2 text-right text-ink text-sm font-semibold">{row.jobs}</span>
                <span className={`col-span-2 text-right text-xs font-semibold ${row.trend === 'up' ? 'text-[#0A7A54]' : 'text-[#B32B2B]'}`}>
                  {row.growth}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard title="Recent Platform Activity" icon={TrendingUp}>
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {recentActivity.map((event) => (
              <div key={event.id} className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-canvas transition-colors">
                <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-soft text-sm leading-snug">{event.text}</p>
                  <p className="text-ink-faint text-xs mt-0.5">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top Performing Companies */}
      <SectionCard title="Top Performing Companies" icon={Building2}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-faint text-xs font-medium border-b border-line">
                <th className="text-left pb-3 pr-4">Company</th>
                <th className="text-right pb-3 pr-4">Jobs Posted</th>
                <th className="text-right pb-3 pr-4">Applications</th>
                <th className="text-right pb-3 pr-4">Hire Rate</th>
                <th className="text-right pb-3">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft/50">
              {topCompanies.map((company) => (
                <tr key={company.company} className="hover:bg-canvas transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                        {company.logo}
                      </div>
                      <span className="text-ink font-medium">{company.company}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-ink-soft font-medium">{company.jobsPosted}</td>
                  <td className="py-3 pr-4 text-right text-ink-soft">{company.applications.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-[#0A7A54] font-semibold">{company.hireRate}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.planColor === 'indigo'
                          ? 'bg-brand-50 text-brand-700 border border-brand-100'
                          : company.planColor === 'blue'
                          ? 'bg-blue-900/50 text-brand-700 border border-blue-700/50'
                          : 'bg-canvas text-ink-soft border border-line'
                      }`}
                    >
                      {company.plan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
