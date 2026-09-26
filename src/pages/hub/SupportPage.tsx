import React, { useState } from 'react';
import { BookOpen, MessageCircle, Mail, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';

const FAQ_ITEMS = [
  {
    q: 'How long does it take to generate an application?',
    a: 'The full pipeline — schema, APIs, frontend, and deployment config — typically completes in 5–10 minutes for a standard 5–8 entity workflow.',
  },
  {
    q: 'Can I edit the generated code after downloading?',
    a: 'Yes. All generated code is MIT-licensed and fully editable. You own 100% of the source code with no restrictions.',
  },
  {
    q: 'What file types can I upload for workflow extraction?',
    a: 'Excel (.xlsx, .xls), CSV, and PDF documents, up to 10 MB each. Image uploads (screenshots, diagrams) aren\'t supported yet.',
  },
  {
    q: 'Why did my AI extraction fail?',
    a: 'Extraction may fail if the intake description is very short (< 200 characters), the Gemini API is temporarily unavailable, or the IntakeBundle has validation errors. Try the retry button or re-complete the intake.',
  },
  {
    q: 'Can I switch my domain from clinic to school?',
    a: 'Domain selection cannot be changed after intake is submitted. You would need to create a new project.',
  },
  {
    q: 'How do I connect my custom domain?',
    a: 'Custom domains aren\'t supported yet. The Deployment Hub gives you a real Docker/Railway/Render config and a downloadable ZIP so you can deploy the generated app yourself, including to your own domain.',
  },
  {
    q: 'Is my data secure?',
    a: 'All data is encrypted in transit (TLS 1.2+) and at rest. Passwords are bcrypt-hashed. We follow OWASP security guidelines.',
  },
  {
    q: 'What happens when I archive a project?',
    a: 'The project is hidden from your main hub. Any live deployments remain active. You can restore it at any time from Archived Projects.',
  },
];

const QuickCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  linkText: string;
  onClick?: () => void;
  badge?: string;
}> = ({ icon, iconBg, title, subtitle, linkText, onClick, badge }) => (
  <div 
    onClick={onClick}
    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex-1 cursor-pointer group"
  >
    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', iconBg)}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 font-poppins mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-4">{subtitle}</p>
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-[#0F766E] hover:underline">{linkText}</span>
      {badge && <span className="text-xs text-green-600 font-medium">{badge}</span>}
    </div>
  </div>
);

const AccordionItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void; index: number }> = ({
  question, answer, isOpen, onToggle, index
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className="border-b border-slate-100"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 text-left group"
    >
      <span className={cn('font-semibold text-sm pr-4 transition-colors', isOpen ? 'text-[#0F766E]' : 'text-slate-800 group-hover:text-slate-900')}>
        {question}
      </span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
        <ChevronDown size={18} className={cn('transition-colors', isOpen ? 'text-[#0F766E]' : 'text-slate-400')} />
      </motion.div>
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
          <p className="text-sm text-slate-500 pb-5 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Header */}
        <div className="mb-10">
          <h1 className="text-[32px] font-bold text-slate-900 font-poppins mb-2">Help & Support</h1>
          <p className="text-slate-500">Find answers, watch tutorials, or contact our team.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <QuickCard
            icon={<BookOpen size={22} className="text-blue-600" />}
            iconBg="bg-blue-50"
            title="Documentation"
            subtitle="Browse guides and tutorials"
            linkText="Open Docs →"
            onClick={() => window.open('https://flowforge.io/docs', '_blank')}
          />
          <QuickCard
            icon={<MessageCircle size={22} className="text-teal-600" />}
            iconBg="bg-teal-50"
            title="Live Chat"
            subtitle="Chat with our support team"
            linkText="Start Chat →"
            badge="Typically replies in < 2 hours"
            onClick={() => alert('Chat is currently offline. Please send an email.')}
          />
          <QuickCard
            icon={<Mail size={22} className="text-purple-600" />}
            iconBg="bg-purple-50"
            title="Email Support"
            subtitle="Send us a detailed message"
            linkText="Send Email →"
            onClick={() => window.location.href = 'mailto:support@flowforge.io'}
          />
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-1">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm mb-6">Quick answers to common questions.</p>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden px-6">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                index={i}
                question={item.q}
                answer={item.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 font-poppins mb-1">Still need help?</h2>
          <p className="text-slate-500 text-sm mb-6">
            There's no support ticket system yet — email us directly and we'll get back to you.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
            <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mb-5">
              <Mail size={28} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-poppins mb-2">Email our team</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-md">
              Describe your issue and we'll reply as soon as we can.
            </p>
            <a href="mailto:support@flowforge.io?subject=FlowForge%20support%20request">
              <Button className="h-11 px-8 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold shadow-sm">
                support@flowforge.io →
              </Button>
            </a>
          </div>
      </div>
    </motion.div>
  );
};

export default SupportPage;
