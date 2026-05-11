import React, { useState } from 'react';
import { Mail, Search, Lock, ChevronDown, ChevronUp, UploadCloud, Plus, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(85); // Mock strength
  const [isEmailPending, setIsEmailPending] = useState(true); // Mock pending state

  return (
    <div className="pb-10">
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
        <p className="text-slate-500 font-inter mt-1">Manage your professional profile and branding identity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column - Personal Info & Security */}
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
                    We sent a link to <span className="font-semibold">{user?.email}</span> — click it to confirm.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <button className="text-xs font-semibold text-amber-600 hover:text-amber-800">Resend</button>
                  <span className="text-amber-200">|</span>
                  <button onClick={() => setIsEmailPending(false)} className="text-xs font-semibold text-amber-600 hover:text-amber-800">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Input label="FULL NAME" defaultValue={user?.fullName || ''} />
              <Input label="BUSINESS NAME" defaultValue={user?.businessName || user?.orgType || ''} />
              <div className="md:col-span-2 relative">
                <Input 
                  label={isEmailPending ? "CURRENT EMAIL" : "EMAIL ADDRESS"}
                  defaultValue={user?.email || ''} 
                  readOnly={isEmailPending}
                  className={cn("pr-24", isEmailPending && "bg-slate-50")}
                />
                <div className="absolute right-3 top-[34px] flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">
                  <CheckCircle2 size={12} className="mr-1" /> VERIFIED
                </div>
              </div>
            </div>

            {/* Security Section */}
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
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-6 space-y-6 border-t border-slate-100">
                      <Input label="CURRENT PASSWORD" type="password" placeholder="••••••••••••" />
                      <div className="space-y-2">
                        <Input label="NEW PASSWORD" type="password" placeholder="••••••••••••" />
                        <div className="h-1 w-full bg-slate-100 rounded-full">
                          <div className="h-full bg-teal-500" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Update Password</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-6">Help & Support</h2>
            <div className="space-y-4">
              {[
                { q: "How do I update my business domain?", a: "You can change your domain from the Project Hub by creating a new project with the desired sector." },
                { q: "Can I export my project data?", a: "Yes, you can export your intake data as a PDF or JSON from the Project Review page." },
                { q: "Is my medical data secure?", a: "Absolutely. We use HIPAA-compliant storage and end-to-end encryption for all sensitive fields." }
              ].map((faq, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{faq.q}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Branding & Notifications */}
        <div className="lg:col-span-4 space-y-8">
          {/* Notifications Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-6">Notifications</h2>
            <div className="space-y-6">
              {[
                { title: "Security Alert", msg: "A new login was detected from US West (Railway).", time: "2h ago", type: "alert" },
                { title: "Project Milestone", msg: "Clinic CRM project reached 'Intake Review' phase.", time: "5h ago", type: "success" },
                { title: "Plan Update", msg: "Your trial period ends in 3 days. Upgrade for unlimited seats.", time: "1d ago", type: "info" }
              ].map((n, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-150",
                    n.type === 'alert' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  )} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.msg}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-medium uppercase tracking-wider">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-6">Business Branding</h2>
            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BRAND IDENTITY LOGO</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F766E] hover:bg-teal-50/30 transition-all group">
                <div className="h-14 w-14 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-[#34D399] group-hover:scale-110 transition-transform">
                  <UploadCloud size={28} />
                </div>
                <p className="text-sm font-bold text-slate-700">Upload logo</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG/SVG max 5MB</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">THEME COLORS</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-10 w-full bg-[#0F766E] rounded-lg shadow-inner" />
                  <p className="text-[10px] text-center font-bold text-slate-400">#0F766E</p>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-full bg-[#4F46E5] rounded-lg shadow-inner" />
                  <p className="text-[10px] text-center font-bold text-slate-400">#4F46E5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
