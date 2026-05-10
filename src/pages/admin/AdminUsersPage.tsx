import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  Search, 
  Download, 
  MoreVertical, 
  Eye, 
  UserX, 
  Mail, 
  Trash2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { Avatar } from '../../components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_USERS = [
  { id: 'u1', name: 'Dr. Sara Ahmed', email: 'sara@alshifaclinic.com', orgType: 'Clinic', joined: '15 Jan 2026', projects: 3, status: 'ACTIVE' },
  { id: 'u2', name: 'Alex Rivera', email: 'alex@riverside.edu', orgType: 'School', joined: '20 Jan 2026', projects: 1, status: 'ACTIVE' },
  { id: 'u3', name: 'James Wilson', email: 'james@cityclinic.pk', orgType: 'Clinic', joined: '02 Feb 2026', projects: 0, status: 'UNVERIFIED' },
  { id: 'u4', name: 'Zoya Khan', email: 'zoya@stmarys.edu', orgType: 'School', joined: '05 Feb 2026', projects: 2, status: 'ACTIVE' },
  { id: 'u5', name: 'Omar Riaz', email: 'omar@alshifa.com', orgType: 'Clinic', joined: '10 Feb 2026', projects: 0, status: 'SUSPENDED' },
];

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout currentSection="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins">User Management</h1>
            <p className="text-slate-500 mt-1">Manage platform users, organizations, and permissions.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Download size={16} />Export CSV
            </button>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-72 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">USER</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ORG TYPE</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">JOINED</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROJECTS</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">STATUS</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar name={user.name} size="md" className="bg-slate-100 text-[#0F766E] font-bold" />
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider",
                        user.orgType === 'Clinic' ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {user.orgType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.joined}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">{user.projects} projects</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1.5",
                        user.status === 'ACTIVE' ? "bg-green-100 text-green-700" :
                        user.status === 'UNVERIFIED' ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          user.status === 'ACTIVE' ? "bg-green-500" :
                          user.status === 'UNVERIFIED' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {user.status === 'UNVERIFIED' ? (
                          <button className="text-xs font-bold text-[#0F766E] hover:underline px-2 py-1">Resend Email</button>
                        ) : (
                          <button className="p-2 text-slate-400 hover:text-[#0F766E] hover:bg-teal-50 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenu === user.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden"
                                >
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                    <Eye size={16} className="text-slate-400" /> View Details
                                  </button>
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                    <Mail size={16} className="text-slate-400" /> Contact User
                                  </button>
                                  <div className="h-[1px] bg-slate-100 my-1" />
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-3">
                                    <UserX size={16} /> Suspend User
                                  </button>
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                                    <Trash2 size={16} /> Delete Account
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Showing 1 to {filteredUsers.length} of 142 users</span>
            <div className="flex items-center space-x-2">
              <button disabled className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 bg-white cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-[#0F766E] bg-white hover:bg-teal-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* Empty State Simulation */}
        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 font-poppins">No users found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">We couldn't find any users matching your search criteria. Try a different name or email.</p>
            <button 
              onClick={() => setSearch('')}
              className="mt-6 text-[#0F766E] font-bold text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
