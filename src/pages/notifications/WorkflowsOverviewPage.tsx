import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, HelpCircle, ArrowRight, ChevronDown, ChevronUp,
  Users, Mail, Zap, CheckCircle2
} from 'lucide-react';

interface WorkflowState {
  id: string;
  label: string;
  style: 'start' | 'active' | 'end' | 'default';
  actor: string;
}

interface StateDetail {
  id: string;
  actions: string[];
  roles: string[];
  notification: string;
}

const WORKFLOW_STATES: WorkflowState[] = [
  { id: 'booked', label: 'APPOINTMENT\nBOOKED', style: 'start', actor: 'By: Receptionist' },
  { id: 'confirmed', label: 'APPOINTMENT\nCONFIRMED', style: 'active', actor: 'By: Receptionist' },
  { id: 'visited', label: 'PATIENT\nVISITED', style: 'active', actor: 'By: Doctor' },
  { id: 'invoice', label: 'INVOICE\nGENERATED', style: 'active', actor: 'By: Receptionist' },
  { id: 'payment', label: 'PAYMENT\nCOMPLETED', style: 'end', actor: 'By: Receptionist' },
];

const STATE_DETAILS: StateDetail[] = [
  {
    id: 'booked',
    actions: ['Confirm Appointment', 'Cancel Appointment', 'Reschedule'],
    roles: ['Receptionist'],
    notification: 'Patient receives SMS/email: "Your appointment has been scheduled."',
  },
  {
    id: 'confirmed',
    actions: ['Mark as Visited', 'Reschedule', 'Cancel'],
    roles: ['Receptionist', 'Doctor'],
    notification: 'Patient receives email confirmation and reminder 1 hour before.',
  },
  {
    id: 'visited',
    actions: ['Add Prescription', 'Add Notes', 'Generate Invoice'],
    roles: ['Doctor', 'Receptionist'],
    notification: 'Receptionist is notified: "Visit completed — invoice pending."',
  },
  {
    id: 'invoice',
    actions: ['Record Cash Payment', 'Record Card Payment', 'Send Payment Reminder'],
    roles: ['Receptionist', 'Manager'],
    notification: 'Patient receives payment summary email.',
  },
  {
    id: 'payment',
    actions: ['Download Receipt', 'Book Follow-up', 'Mark as Archived'],
    roles: ['Receptionist', 'Manager'],
    notification: 'Payment confirmation sent to patient and manager.',
  },
];

const stateStyles = {
  start: 'border-slate-300 bg-slate-50 text-slate-700',
  active: 'border-[#0F766E] bg-teal-50 text-[#0F766E]',
  end: 'border-green-400 bg-green-50 text-green-700',
  default: 'border-slate-200 bg-white text-slate-600',
};

const WorkflowsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [openState, setOpenState] = useState<string | null>('confirmed');
  const [activeTab, setActiveTab] = useState<'alerts' | 'workflows'>('workflows');

  const NAV_TABS = [
    { id: 'workflows', label: 'Workflows' },
    { id: 'alerts', label: 'Alerts Setup' },
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
            <span className="text-white">Workflows</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'alerts') navigate(`/project/${projectId || 'new'}/alerts`);
              }}
              className={cn(
                'text-sm font-bold pb-1 mt-1 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-white border-white'
                  : 'text-white/40 hover:text-white/70 border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Dashboard</button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white"><Bell size={20} /></button>
          <button className="text-white/70 hover:text-white"><HelpCircle size={20} /></button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 font-poppins">Workflow States & Transitions</h1>
            <p className="text-slate-500 mt-1 text-sm">These are the workflow stages built into your My Organization application.</p>
          </div>

          {/* Visual Workflow Map */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-8 overflow-x-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Appointment Lifecycle</p>
            <div className="flex items-start gap-2 min-w-max">
              {WORKFLOW_STATES.map((state, i) => (
                <React.Fragment key={state.id}>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setOpenState(openState === state.id ? null : state.id)}
                      className={cn(
                        'rounded-xl border-2 px-5 py-4 min-w-[140px] text-center transition-all hover:shadow-md',
                        stateStyles[state.style],
                        openState === state.id && 'shadow-md ring-2 ring-offset-2',
                        state.style === 'active' ? 'ring-[#0F766E]/30' : state.style === 'end' ? 'ring-green-400/30' : 'ring-slate-300/30'
                      )}
                    >
                      {state.label.split('\n').map((line, j) => (
                        <p key={j} className={cn('text-xs font-bold tracking-wide leading-tight', j === 0 && 'opacity-60 text-[10px] mb-0.5')}>{line}</p>
                      ))}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2 whitespace-nowrap">{state.actor}</p>
                  </div>

                  {i < WORKFLOW_STATES.length - 1 && (
                    <div className="flex flex-col items-center pt-5">
                      <ArrowRight size={20} className="text-slate-300 mx-1" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* State Details Accordion */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">State Details</p>
            {STATE_DETAILS.map((detail, i) => {
              const state = WORKFLOW_STATES.find(s => s.id === detail.id)!;
              const isOpen = openState === detail.id;
              return (
                <div
                  key={detail.id}
                  className={cn(
                    'bg-white border rounded-xl overflow-hidden transition-all',
                    isOpen ? 'border-[#0F766E] shadow-sm' : 'border-slate-200'
                  )}
                >
                  <button
                    onClick={() => setOpenState(isOpen ? null : detail.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        state.style === 'end' ? 'bg-green-400' : state.style === 'start' ? 'bg-slate-300' : 'bg-[#0F766E]'
                      )} />
                      <p className="font-semibold text-slate-800 text-sm">{state.label.replace('\n', ' ')}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                              <Zap size={11} />Allowed Actions
                            </p>
                            <ul className="space-y-1.5">
                              {detail.actions.map(a => (
                                <li key={a} className="flex items-center gap-2 text-xs text-slate-600">
                                  <CheckCircle2 size={12} className="text-[#0F766E] shrink-0" />{a}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                              <Users size={11} />Allowed Roles
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {detail.roles.map(r => (
                                <span key={r} className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-100">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                              <Mail size={11} />Notification Trigger
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed">{detail.notification}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={() => navigate(`/project/${projectId || 'new'}/blueprint`)}>
              ← Back to Blueprint
            </Button>
            <Button
              className="bg-[#0F766E] hover:bg-[#0D6B63] text-white px-6"
              onClick={() => navigate(`/project/${projectId || 'new'}/alerts`)}
            >
              Set Up Alerts →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowsOverviewPage;
