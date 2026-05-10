import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  BarChart3, 
  ChevronDown, 
  Zap, 
  Mail, 
  Info,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';

const AdminApiUsagePage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('May 2026');

  // Daily requests for May 1-9
  const dailyRequests = [
    { day: '01', val: 120 },
    { day: '02', val: 145 },
    { day: '03', val: 98 },
    { day: '04', val: 165 },
    { day: '05', val: 190 },
    { day: '06', val: 130 },
    { day: '07', val: 110 },
    { day: '08', val: 155 },
    { day: '09', val: 180, active: true },
  ];

  const maxVal = 200;

  return (
    <AdminLayout currentSection="API Usage & Costs">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins">API Usage & Costs</h1>
            <p className="text-slate-500 mt-1">Monitor platform service consumption and budget.</p>
          </div>
          <div className="relative">
            <button className="flex items-center gap-3 h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-300 transition-colors shadow-sm">
              {selectedMonth}
              <ChevronDown size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Usage Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gemini API Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-teal-50 rounded-full opacity-50 transition-transform group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0F766E] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-700/20">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Google Gemini API</h3>
                    <p className="text-xs text-slate-500">Code Generation & Extraction</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 font-poppins">$48.32</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL COST</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Requests</p>
                  <p className="text-lg font-bold text-slate-800">1,247</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Latency</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" /> 4.2s
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 uppercase tracking-tight">Monthly Budget Usage</span>
                  <span className="font-bold text-slate-900">48% ($100 limit)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full" 
                    style={{ width: '48%' }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SendGrid Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-700/20">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">SendGrid</h3>
                    <p className="text-xs text-slate-500">Email Notifications</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 font-poppins">$0.00</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FREE TIER</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emails Sent</p>
                  <p className="text-lg font-bold text-slate-800">892</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Rate</p>
                  <p className="text-lg font-bold text-green-600">98.7%</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Free Tier:</strong> You have used 892 of 12,000 monthly free emails. 11 bounces detected this month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Timeline Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Daily Gemini API Requests</h3>
              <p className="text-xs text-slate-500">May 1 – May 9, 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3 h-3 bg-teal-400 rounded" /> Past
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3 h-3 bg-[#0F766E] rounded" /> Today
              </div>
            </div>
          </div>

          <div className="relative h-64 flex items-end justify-between px-4">
            {/* Y-axis labels */}
            <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-300 font-bold pointer-events-none">
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* Grid lines */}
            <div className="absolute left-6 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-full h-[1px] bg-slate-100" />
              ))}
            </div>

            {/* Bars */}
            {dailyRequests.map((item, i) => (
              <div key={i} className="relative flex flex-col items-center gap-4 w-full group">
                <div className="relative w-16 h-full flex items-end justify-center z-10">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.val / maxVal) * 100}%` }}
                    className={cn(
                      "w-10 rounded-t-xl transition-all duration-300 relative group-hover:opacity-90",
                      item.active ? "bg-[#0F766E] shadow-lg shadow-teal-900/20" : "bg-teal-400/80"
                    )}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {item.val} requests
                    </div>
                  </motion.div>
                </div>
                <span className={cn(
                  "text-[11px] font-bold tracking-tight",
                  item.active ? "text-[#0F766E]" : "text-slate-400"
                )}>
                  May {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert for Budget */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">Approaching Budget Threshold</h4>
            <p className="text-sm text-amber-800/80 mt-1">
              Gemini API usage is at 48% of your monthly budget. You will receive an automated alert when it reaches 80%. 
              Estimated month-end cost: <strong>$161.07</strong> (exceeds budget).
            </p>
            <button className="mt-3 text-xs font-bold text-amber-700 hover:underline">Adjust budget limits</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApiUsagePage;
