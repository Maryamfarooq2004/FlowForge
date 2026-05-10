import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../shared/Logo';
import { Bell, HelpCircle, ChevronDown, User, Settings, Shield, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { NotificationPanel } from '../../features/notifications/components/NotificationPanel';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  projectName?: string;
  currentSection?: string;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ projectName, currentSection, isAdmin }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 sticky top-0 z-50">
        {/* Left: Logo & Breadcrumb */}
        <div className="flex items-center space-x-8">
          <Link to="/hub">
            <Logo size="sm" variant="light" useSecondary={true} />
          </Link>

          {projectName && (
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <div className="h-4 w-[1px] bg-white/20 mx-1" />
              <span className="text-teal-200 font-medium">{projectName}</span>
              <span className="text-white/30">/</span>
              <span className="text-white font-medium">{currentSection}</span>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center space-x-3">
              <div className="h-4 w-[1px] bg-white/20 mx-1" />
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                ADMIN
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
            aria-label="Open notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-[#DC2626] rounded-full border border-[#134E4A]" />
          </button>

          <Link to="/hub/support" className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <HelpCircle size={20} />
          </Link>

          <div className="h-8 w-[1px] bg-white/20 mx-2" />

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 pl-2 hover:bg-white/5 rounded-lg p-1 transition-colors"
            >
              <Avatar name={user?.fullName || "User"} size="sm" className="bg-[#34D399] text-[#134E4A]" />
              <ChevronDown size={16} className={cn("text-white/50 transition-transform", isMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email}</p>
                    </div>
                    
                    <Link to="/hub/settings" className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F766E] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link to="/hub/settings" className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F766E] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <Settings size={16} />
                      <span>Account Settings</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0F766E] transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <Shield size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <div className="h-[1px] bg-slate-100 my-1" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <NotificationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </>
  );
};

