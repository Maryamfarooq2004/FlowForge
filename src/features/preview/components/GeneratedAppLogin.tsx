import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/classNames';
import { Button } from '../../../components/ui/Button';
import { BriefcaseMedical, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface GeneratedAppLoginProps {
  appName: string;
  appTheme: 'blue' | 'teal' | 'indigo' | 'emerald';
  roles: string[];
}

export const GeneratedAppLogin: React.FC<GeneratedAppLoginProps> = ({ 
  appName = "My Organization", 
  appTheme = 'teal',
  roles = ['Receptionist', 'Doctor', 'Manager']
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const themeColors = {
    blue: { bg: 'bg-[#1E3A8A]', text: 'text-[#1E3A8A]', ring: 'focus:ring-[#1E3A8A]', gradient: 'from-blue-50 to-slate-100' },
    teal: { bg: 'bg-[#0F766E]', text: 'text-[#0F766E]', ring: 'focus:ring-[#0F766E]', gradient: 'from-teal-50 to-slate-100' },
    indigo: { bg: 'bg-[#4F46E5]', text: 'text-[#4F46E5]', ring: 'focus:ring-[#4F46E5]', gradient: 'from-indigo-50 to-slate-100' },
    emerald: { bg: 'bg-[#047857]', text: 'text-[#047857]', ring: 'focus:ring-[#047857]', gradient: 'from-emerald-50 to-slate-100' },
  };

  const currentTheme = themeColors[appTheme] || themeColors.teal;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setHasError(true);
      return;
    }
    
    setIsLoggingIn(true);
    setHasError(false);
    
    // Simulate login error for preview purposes
    setTimeout(() => {
      setIsLoggingIn(false);
      setHasError(true);
    }, 1200);
  };

  return (
    <div className={cn("w-full min-h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br font-inter overflow-y-auto py-12", currentTheme.gradient)}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 lg:p-10 relative overflow-hidden"
      >
        {/* Top colored edge */}
        <div className={cn("absolute top-0 left-0 w-full h-1.5", currentTheme.bg)}></div>
        
        {/* Logo */}
        <div className={cn("w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm", currentTheme.bg)}>
          <BriefcaseMedical size={32} className="text-white" />
        </div>
        
        <h1 className="text-[22px] font-bold text-slate-800 font-poppins text-center">{appName}</h1>
        <p className="text-sm text-slate-400 text-center mb-8">Staff Login</p>
        
        <h2 className="text-2xl font-bold text-slate-800 font-poppins mb-6">Welcome Back</h2>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2" htmlFor="preview-email">Work Email</label>
            <input 
              id="preview-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@clinic.app" 
              className={cn("w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:outline-2 focus:outline-offset-2 transition-all", currentTheme.ring.replace('ring-', 'outline-').replace('focus:ring-', 'focus:outline-'))}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="preview-password">Password</label>
            </div>
            <div className="relative">
              <input 
                id="preview-password"
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className={cn("w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:outline-2 focus:outline-offset-2 transition-all", currentTheme.ring.replace('ring-', 'outline-').replace('focus:ring-', 'focus:outline-'))}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className={cn("text-xs font-semibold hover:underline", currentTheme.text)}>Forgot Password?</Link>
            </div>
          </div>
          
          <Button 
            type="submit"
            isLoading={isLoggingIn}
            className={cn("w-full h-12 text-white font-bold rounded-xl shadow-md transition-transform active:scale-[0.98]", currentTheme.bg, currentTheme.bg.replace('bg-', 'hover:bg-').replace(']', ']/90]'))}
          >
            Login
          </Button>
          
          {/* Error State */}
          {hasError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 flex items-start space-x-2.5 mt-4"
              role="alert"
            >
              <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 leading-snug">Invalid email or password. 3 attempts remaining.</p>
            </motion.div>
          )}
        </form>
      </motion.div>
      
      {/* Role Info Note */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-slate-500 text-center mt-6 max-w-sm mx-auto leading-relaxed"
      >
        This app has {roles.length} roles: <span className={cn("font-semibold", currentTheme.text)}>{roles.join(', ')}</span>. 
        Please log in with your assigned credentials.
      </motion.p>
      
    </div>
  );
};
