'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, Loader2, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  phone?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const res = await apiFetch('/api/admin/users');
      if (res.ok) { const data = await res.json(); setUsers(data.data || []); }
    } finally { setLoading(false); }
  }

  async function toggleBlock(userId: string, isBlocked: boolean) {
    setActionUserId(userId);
    try {
      await apiFetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isBlocked: !isBlocked }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !isBlocked } : u));
    } finally { setActionUserId(null); }
  }

  async function changeRole(userId: string, role: string) {
    await apiFetch(`/api/admin/users`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const ROLE_STYLES: Record<string, string> = {
    ADMIN: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
    RECRUITER: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
    CANDIDATE: 'bg-brand-50 text-brand-600 border-brand-100',
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#B32B2B] animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">User Management</h1>
          <p className="text-ink-muted mt-1">{users.length} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-white border border-line text-ink placeholder-ink-faint rounded-[16px] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F3C9C9]" />
        </div>
        <div className="flex gap-2">
          {['ALL', 'CANDIDATE', 'RECRUITER', 'ADMIN'].map(role => (
            <button key={role} onClick={() => setRoleFilter(role)} className={`px-4 py-2.5 rounded-[16px] text-sm font-medium transition-all ${roleFilter === role ? 'bg-critical text-ink' : 'bg-white border border-line text-ink-muted hover:text-ink'}`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-[16px] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-ink-muted font-semibold uppercase tracking-wide border-b border-line">
          <div className="col-span-3">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Joined</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-ink-faint mx-auto mb-2" />
            <p className="text-ink-muted text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-line-soft">
            {filtered.map(user => (
              <div key={user.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center transition-colors hover:bg-canvas ${user.isBlocked ? 'opacity-60' : ''}`}>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F5D95] to-[#0F4C81] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-medium text-ink truncate">{user.name}</span>
                </div>
                <div className="col-span-3 text-sm text-ink-muted truncate">{user.email}</div>
                <div className="col-span-2">
                  <select
                    value={user.role}
                    onChange={e => changeRole(user.id, e.target.value)}
                    className={`text-xs border rounded-full px-2.5 py-1 bg-transparent focus:outline-none cursor-pointer ${ROLE_STYLES[user.role] || 'border-line text-ink-muted'}`}
                  >
                    <option value="CANDIDATE">CANDIDATE</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="col-span-2">
                  {user.isBlocked ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#B32B2B]"><Ban className="w-3.5 h-3.5" />Blocked</span>
                  ) : user.isVerified ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#0A7A54]"><CheckCircle className="w-3.5 h-3.5" />Verified</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-[#9A5D00]"><Shield className="w-3.5 h-3.5" />Pending</span>
                  )}
                </div>
                <div className="col-span-1 text-xs text-ink-faint">{new Date(user.createdAt).toLocaleDateString()}</div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => toggleBlock(user.id, user.isBlocked)}
                    disabled={actionUserId === user.id || user.role === 'ADMIN'}
                    className={`p-1.5 rounded-lg transition-all ${user.isBlocked ? 'text-ink-muted hover:text-[#0A7A54] hover:bg-positive-soft' : 'text-ink-muted hover:text-[#B32B2B] hover:bg-critical-soft'} disabled:opacity-30 disabled:cursor-not-allowed`}
                    title={user.isBlocked ? 'Unblock' : 'Block'}
                  >
                    {actionUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
