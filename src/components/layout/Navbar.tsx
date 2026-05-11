import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

export const Navbar = () => {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get initials from real user data
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="h-14 bg-[#134E4A] fixed top-0 left-0 right-0 z-50 
                    flex items-center justify-between px-6 shadow-sm">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-teal-300 hover:text-white 
                     hover:bg-teal-700/50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/hub')}
        >
          <div className="w-7 h-7 bg-teal-400/20 rounded-lg flex items-center 
                          justify-center border border-teal-400/30">
            <span className="text-teal-300 font-bold text-xs">FF</span>
          </div>
          <span className="text-white font-bold text-base font-poppins tracking-tight">
            FlowForge
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button 
          onClick={() => navigate('/hub/notifications')}
          className="p-2 rounded-lg text-teal-300 hover:text-white 
                           hover:bg-teal-700/50 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Help */}
        <button 
          onClick={() => navigate('/hub/support')}
          className="p-2 rounded-lg text-teal-300 hover:text-white 
                           hover:bg-teal-700/50 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Avatar Dropdown — uses REAL user data from MongoDB */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl 
                       hover:bg-teal-700/50 transition-colors"
          >
            {/* Avatar with initials from real user data */}
            <div className="w-7 h-7 rounded-full bg-[#0F766E] flex items-center 
                            justify-center border-2 border-teal-400/40">
              <span className="text-white text-xs font-semibold">
                {user ? getInitials(user.fullName) : '?'}
              </span>
            </div>
            {/* Name from MongoDB */}
            <span className="text-sm text-white font-medium hidden sm:block 
                             max-w-[120px] truncate">
              {user?.fullName ?? 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-teal-300" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white rounded-xl 
                            border border-slate-200 shadow-xl z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email}
                </p>
                {user?.orgType && (
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full 
                                   font-medium mt-1.5 capitalize
                    ${user.orgType === 'clinic'
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-purple-100 text-purple-700'
                    }`}>
                    {user.orgType}
                  </span>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { navigate('/hub/settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm 
                             text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/hub/settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm 
                             text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => { logout(); setDropdownOpen(false); }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm 
                             text-red-600 hover:bg-red-50 transition-colors 
                             disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
