import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { Avatar } from '../../components/ui/Avatar';
import { useAdminUsers, useSetUserRole } from '../../hooks/useAdmin';
import { useAuthStore } from '../../store/authStore';

const AdminUsersPage: React.FC = () => {
  const { user: me } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminUsers({ search, page });
  const setRole = useSetUserRole();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <AdminLayout currentSection="User Management">
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins">User Management</h1>
            <p className="text-slate-500 mt-1">{total} user{total === 1 ? '' : 's'} · promote or revoke admin access.</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              aria-label="Search users"
              className="pl-10 pr-4 h-10 w-72 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Org</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Projects</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No users found.</td></tr>
                ) : (
                  users.map((u) => {
                    const isSelf = me?.id === u.id;
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar name={u.fullName} size="md" className="bg-slate-100 text-[#0F766E] font-bold" />
                            <div>
                              <p className="font-bold text-slate-900">{u.fullName}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider capitalize',
                            u.organizationType === 'clinic' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700')}>
                            {u.organizationType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1.5',
                            isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600')}>
                            <div className={cn('w-1.5 h-1.5 rounded-full', isAdmin ? 'bg-indigo-500' : 'bg-slate-400')} />
                            {isAdmin ? 'ADMIN' : 'USER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{u.projectCount}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            disabled={isSelf || setRole.isPending}
                            title={isSelf ? "You can't change your own role" : undefined}
                            onClick={() => setRole.mutate({ id: u.id, role: isAdmin ? 'user' : 'admin' })}
                            className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40',
                              isAdmin ? 'text-amber-700 hover:bg-amber-50' : 'text-[#0F766E] hover:bg-teal-50')}
                          >
                            {isAdmin ? <><ShieldOff size={14} /> Revoke admin</> : <><ShieldCheck size={14} /> Make admin</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-[#0F766E] bg-white disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-teal-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
