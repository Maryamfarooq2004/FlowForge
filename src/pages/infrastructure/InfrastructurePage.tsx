import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, HelpCircle, ChevronDown, ChevronUp,
  ArrowRight, Cpu, Database, Globe, CheckCircle2, AlertCircle
} from 'lucide-react';

interface EnvVar {
  name: string;
  description: string;
  required: boolean;
}

const ENV_VARS: EnvVar[] = [
  { name: 'DATABASE_URL', description: 'PostgreSQL connection string', required: true },
  { name: 'JWT_SECRET', description: '256-bit secret for token signing', required: true },
  { name: 'SENDGRID_API_KEY', description: 'Email delivery via SendGrid', required: false },
  { name: 'SENTRY_DSN', description: 'Error tracking & performance alerts', required: false },
];

const InfrastructurePage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [envOpen, setEnvOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'intake' | 'infrastructure'>('infrastructure');

  const NAV_TABS = [
    { id: 'intake', label: 'Intake Flow', path: `/project/${projectId || 'new'}/intake/form` },
    { id: 'infrastructure', label: 'Infrastructure', path: `/project/${projectId || 'new'}/infrastructure` },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">My Organization</span>
            <span className="text-white/30">›</span>
            <span className="text-white">Infrastructure</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveNavTab(tab.id); navigate(tab.path); }}
              className={cn(
                'text-sm font-bold pb-1 mt-1 border-b-2 transition-colors',
                activeNavTab === tab.id
                  ? 'text-white border-white'
                  : 'text-white/40 hover:text-white/70 border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Settings</button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white"><Bell size={20} /></button>
          <button className="text-white/70 hover:text-white"><HelpCircle size={20} /></button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-poppins">Infrastructure Overview</h1>
            <p className="text-slate-500 mt-1 text-sm">Technical details of your FlowForge deployment environment.</p>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 font-poppins mb-6">Your Deployment Architecture</h2>

            {/* Main 3 boxes */}
            <div className="flex items-stretch gap-4">
              {/* Frontend */}
              <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe size={22} className="text-blue-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">FRONTEND</p>
                <p className="font-bold text-slate-800 text-sm mb-3">React 19.1.0</p>
                <ul className="space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-blue-400 shrink-0" />Tailwind CSS 4.1.0</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-blue-400 shrink-0" />Hosted on Vercel</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-blue-400 shrink-0" />CDN: Global edge</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">LIVE</span>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex items-center shrink-0">
                <ArrowRight size={24} className="text-slate-300" />
              </div>

              {/* Backend */}
              <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Cpu size={22} className="text-green-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">BACKEND</p>
                <p className="font-bold text-slate-800 text-sm mb-3">Node.js 22.0.0</p>
                <ul className="space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-green-400 shrink-0" />Express.js 4.18.2</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-green-400 shrink-0" />Sequelize ORM</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-green-400 shrink-0" />JWT Auth + RBAC</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">LIVE</span>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="flex items-center shrink-0">
                <ArrowRight size={24} className="text-slate-300" />
              </div>

              {/* Database */}
              <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Database size={22} className="text-indigo-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">DATABASE</p>
                <p className="font-bold text-slate-800 text-sm mb-3">PostgreSQL 16.5</p>
                <ul className="space-y-1.5 text-xs text-slate-500">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-indigo-400 shrink-0" />Hosted on Railway</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-indigo-400 shrink-0" />Auto-migrated</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-indigo-400 shrink-0" />Connection pool: 5–20</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">LIVE</span>
                </div>
              </div>
            </div>

            {/* Services Row */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { name: 'Google Gemini API', sub: 'LLM & Code Gen', desc: 'AI Extraction', icon: '🤖' },
                { name: 'SendGrid', sub: 'Email Delivery', desc: 'Notification Emails', icon: '✉️' },
                { name: 'Sentry', sub: 'Error Monitoring', desc: 'Performance Alerts', icon: '🛡️' },
              ].map(svc => (
                <div key={svc.name} className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center hover:bg-slate-100 transition-colors">
                  <p className="text-xl mb-1">{svc.icon}</p>
                  <p className="text-xs font-bold text-slate-700">{svc.name}</p>
                  <p className="text-[10px] font-semibold text-[#0F766E] mt-0.5">{svc.sub}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{svc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Variables Guide */}
          <div className={cn('bg-white border rounded-2xl shadow-sm overflow-hidden transition-all', envOpen ? 'border-[#0F766E]' : 'border-slate-200')}>
            <button
              onClick={() => setEnvOpen(p => !p)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-bold text-slate-800 text-left">Environment Variables Your App Needs</p>
                <p className="text-xs text-slate-400 mt-0.5">Configure these before deploying to production</p>
              </div>
              {envOpen
                ? <ChevronUp size={18} className="text-slate-400" />
                : <ChevronDown size={18} className="text-slate-400" />
              }
            </button>

            <AnimatePresence>
              {envOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-slate-100">
                    <table className="w-full mt-4 text-xs">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">VARIABLE</th>
                          <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">DESCRIPTION</th>
                          <th className="py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">REQUIRED</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {ENV_VARS.map(v => (
                          <tr key={v.name} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 pr-4 font-mono font-bold text-[#0F766E]">{v.name}</td>
                            <td className="py-3 pr-4 text-slate-500">{v.description}</td>
                            <td className="py-3">
                              {v.required ? (
                                <span className="flex items-center gap-1 text-red-600 font-semibold">
                                  <AlertCircle size={12} />Yes
                                </span>
                              ) : (
                                <span className="text-slate-400">Optional</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 bg-slate-50 rounded-xl p-4 font-mono text-xs text-slate-500 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Sample .env</p>
                      <p className="text-green-600">DATABASE_URL</p>
                      <p className="text-slate-400">=postgresql://user:password@host:5432/alshifa</p>
                      <p className="text-green-600 mt-1">JWT_SECRET</p>
                      <p className="text-slate-400">=your-256-bit-secret-here</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InfrastructurePage;
