import React, { useState } from 'react';
import { 
  Search, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  UploadCloud, 
  Plus, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(85); // Mock strength
  const [isEmailPending, setIsEmailPending] = useState(true); // Mock pending state

  return (
    <AppShell className="pb-10">
      {/* Search Header */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search settings..." 
          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all font-inter text-slate-600"
        />
      </div>

      <header className="mb-10">
        <h1 className="text-[32px] font-bold text-slate-900 font-poppins leading-tight">Account Settings</h1>
        <p className="text-slate-500 font-inter mt-1">Manage your professional profile and clinic branding identity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Pending Email Banner */}
          <AnimatePresence>
            {isEmailPending && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start sm:items-center gap-4 flex-col sm:flex-row"
              >
                <div className="bg-amber-100 rounded-full p-2 shrink-0">
                  <Mail className="text-amber-600 h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 text-sm">Email change pending verification</h3>
                  <p className="text-sm text-amber-700 leading-snug mt-0.5">
                    We sent a link to <span className="font-semibold">{user?.email}</span> — click it to confirm. Your current email remains active until then.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <button className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
                    Resend
                  </button>
                  <span className="text-amber-200">|</span>
                  <button 
                    onClick={() => setIsEmailPending(false)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Input 
                label="FULL NAME" 
                defaultValue={user?.fullName || ''} 
                className="font-inter"
              />
              <Input 
                label="BUSINESS NAME" 
                defaultValue={user?.businessName || user?.orgType || ''} 
                className="font-inter"
              />
              <div className="md:col-span-2 relative space-y-4">
                <div className="relative">
                  <Input 
                    label={isEmailPending ? "CURRENT EMAIL" : "EMAIL ADDRESS"}
                    defaultValue={user?.email || ''} 
                    readOnly={isEmailPending}
                    className={cn("font-inter pr-24", isEmailPending && "bg-slate-50 text-slate-500 border-slate-200")}
                  />
                  <div className="absolute right-3 top-[34px] flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                    <CheckCircle2 size={12} />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {isEmailPending && (
                  <div className="relative">
                    <Input 
                      label="PENDING EMAIL" 
                      defaultValue="new@email.com" 
                      className="font-inter pr-24 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                    />
                    <div className="absolute right-3 top-[34px] flex items-center space-x-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider animate-pulse border border-amber-200">
                      <span>PENDING</span>
                    </div>
                    <button 
                      onClick={() => setIsEmailPending(false)}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline mt-2 inline-block font-medium"
                    >
                      Cancel email change ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <button 
                onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Lock size={18} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Change Password</span>
                </div>
                {isPasswordOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {isPasswordOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6 border-t border-slate-100">
                      <Input label="CURRENT PASSWORD" type="password" placeholder="••••••••••••" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NEW PASSWORD</label>
                          <span className="text-[10px] font-bold text-[#0F766E]">STRONG</span>
                        </div>
                        <Input label="NEW PASSWORD" type="password" placeholder="••••••••••••" />
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#34D399] transition-all duration-500" 
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>

                      <Input label="CONFIRM NEW PASSWORD" type="password" placeholder="••••••••••••" />
                      
                      <Button variant="outline" size="sm" className="w-fit">
                        Update Password
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Button className="w-full h-14 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold text-lg shadow-lg shadow-teal-900/10">
            Save Changes
          </Button>
        </div>

        {/* Right Column - Business Branding */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-6">Business Branding</h2>

            {/* Logo Upload */}
            <div className="space-y-3 mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">BRAND IDENTITY LOGO</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F766E] hover:bg-teal-50/30 transition-all group">
                <div className="h-14 w-14 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-[#34D399] group-hover:scale-110 transition-transform">
                  <UploadCloud size={28} />
                </div>
                <p className="text-sm font-bold text-slate-700">Drag and drop logo here</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG up to 5MB</p>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3 mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PREVIEW ON SURFACE</label>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center space-x-4">
                <div className="h-12 w-12 bg-[#134E4A] rounded-lg flex items-center justify-center text-white/50">
                  <Plus size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{user?.businessName || 'My Organization'}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Default Clinic Cross Logo</p>
                </div>
              </div>
            </div>

            {/* Theme Colors */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">THEME COLORS</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-12 w-full bg-[#0F766E] rounded-lg shadow-inner" />
                  <p className="text-[10px] text-center font-bold text-slate-400">#0F766E (Primary)</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full bg-[#4F46E5] rounded-lg shadow-inner" />
                  <p className="text-[10px] text-center font-bold text-slate-400">#4F46E5 (Secondary)</p>
                </div>
              </div>

              <div className="bg-teal-50/80 rounded-xl p-4 flex items-start space-x-3 border border-teal-100/50">
                <Info size={18} className="text-[#0F766E] shrink-0 mt-0.5" />
                <p className="text-xs text-[#0F766E] leading-relaxed font-medium">
                  These colors will be used in your generated application theme to ensure consistent patient experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
