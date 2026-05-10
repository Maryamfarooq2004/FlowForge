import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform
} from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  CreditCard,
  Globe,
  Layout,
  Quote,
  School as SchoolIcon,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import tealLogoImg from '../assets/FlowForge Teal Logo.png';
import { Logo } from '../components/shared/Logo';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/classNames';

/* ── PROFESSIONAL ANIMATION CONSTANTS ── */
const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1];

/* ── HELPER COMPONENTS ── */

const FadeIn = ({ children, delay = 0, className }: { 
  children: React.ReactNode, 
  delay?: number,
  className?: string 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Typewriter = ({ text, delay }: { text: string, delay: number }) => {
  const [currentText, setCurrentText] = useState('');
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setCurrentText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);
  return <span>{currentText}</span>;
};

const StatCounter = ({ value, label, suffix = '', note }: { 
  value: number | string, 
  label: string, 
  suffix?: string,
  note?: string
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && typeof value === 'number' && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(0, value, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setCount(Math.round(v)),
      });
      return controls.stop;
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="group relative pl-6 py-6 border-l border-slate-100 hover:border-[#0F766E] transition-colors duration-500">
      <div className="text-[44px] font-black text-slate-900 font-poppins tracking-[-0.02em] leading-none">
        {typeof value === 'number' ? count : value}{suffix}
      </div>
      <div className="text-[11px] font-medium text-slate-500 tracking-wide mt-3">
        {label}
      </div>
      {note && (
        <div className="text-[9px] font-medium text-slate-400 tracking-wide mt-1">
          {note}
        </div>
      )}
    </div>
  );
};

const TerminalWindow = () => {
  const [visibleLines, setVisibleLines] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const logLines = [
    { text: '> Analyzing workflow description...', status: 'done', time: '0.2s' },
    { text: '> Extracting entities & relationships...', status: 'done', time: '0.8s' },
    { text: '> Generating PostgreSQL schema...', status: 'done', time: '1.1s' },
    { text: '> Building React frontend...', status: 'done', time: '2.3s' },
    { text: '> Deploying to production...', status: 'done', time: '0.4s' },
    { text: '✦ Live at: al-shifa-clinic.flowforge.app', status: 'success', time: '' },
  ];

  useEffect(() => {
    const run = () => {
      setVisibleLines(0);
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setVisibleLines(i);
        if (i >= logLines.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          timeoutRef.current = setTimeout(run, 2500);
        }
      }, 700);
    };
    run();
    return () => { 
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-[#0D1117] rounded-xl p-5 font-mono text-[12px] border border-white/5">
      <div className="flex items-center gap-1.5 mb-5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-slate-600 text-[10px] tracking-wide">flowforge — generation pipeline</span>
      </div>
      <div className="space-y-1.5 min-h-[120px]">
        {logLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center justify-between",
              line.status === 'success' ? 'text-[#4ADE80]' : 'text-slate-400'
            )}
          >
            <span>{line.text}</span>
            {line.time && (
              <span className="text-slate-600 text-[10px] ml-4">✓ {line.time}</span>
            )}
          </motion.div>
        ))}
        {visibleLines < logLines.length && visibleLines > 0 && (
          <span className="text-slate-500 animate-pulse">▋</span>
        )}
      </div>
    </div>
  );
};

const HeroPreview = () => {
  const [state, setState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[420px] lg:h-[480px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Browser Header */}
      <div className="h-12 bg-[#F8FAFC] border-b border-slate-200 flex items-center px-6 space-x-4">
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-slate-200 h-5 w-40 rounded-full text-[9px] text-slate-400 flex items-center justify-center font-medium tracking-wide">
            demo-clinic.flowforge.app
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 h-[calc(100%-48px)] bg-white relative">
        <AnimatePresence mode="wait">
          {state === 0 && (
            <motion.div
              key="state0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-2 border-[#0F766E] rounded-xl p-4 bg-white relative">
                <p className="text-[13px] text-slate-700 font-inter leading-relaxed">
                  <Typewriter text="When a new patient arrives at the clinic, extract their basic info, check insurance eligibility via API, and queue them for the primary physician." delay={45} />
                </p>
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-ping" />
                  <span className="text-[9px] font-semibold text-[#0F766E] uppercase tracking-wider">Analyzing</span>
                </div>
              </div>
            </motion.div>
          )}

          {state === 1 && (
            <motion.div
              key="state1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[11px] font-medium text-slate-400 tracking-wide">Extracted Blueprints</h4>
                <div className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] font-bold rounded-md border border-teal-100">SCHEMA VERIFIED</div>
              </div>
              {['Patient Registry', 'Appointment Engine', 'Billing Ledger'].map((entity, i) => (
                <motion.div
                  key={entity}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex items-center space-x-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    {i === 0 ? <Users size={16} /> : i === 1 ? <Calendar size={16} /> : <CreditCard size={16} />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-24 bg-slate-200 rounded-full" />
                    <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {state === 2 && (
            <motion.div
              key="state2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full border border-slate-100 rounded-xl overflow-hidden"
            >
              <div className="w-16 border-r border-slate-100 bg-slate-50 flex flex-col items-center py-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={cn("w-8 h-8 rounded-lg transition-colors", i === 0 ? "bg-slate-900" : "bg-slate-200/50")} />
                ))}
              </div>
              <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-4 w-32 bg-slate-100 rounded-md" />
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">LIVE</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-full bg-slate-50 rounded-lg border border-slate-100" />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SolutionCard = ({
  icon: Icon,
  title,
  description,
  features,
  variant = 'teal'
}: {
  icon: React.ElementType,
  title: string,
  description: string,
  features: string[],
  variant?: 'teal' | 'indigo'
}) => {
  const accentColor = variant === 'teal' ? 'bg-[#0F766E]' : 'bg-[#4F46E5]';
  const hoverBorder = variant === 'teal' ? 'hover:border-[#0F766E]/30' : 'hover:border-[#4F46E5]/30';
  const hoverBtn = variant === 'teal' ? 'group-hover:bg-[#0F766E] group-hover:text-white group-hover:border-[#0F766E]' : 'group-hover:bg-[#4F46E5] group-hover:text-white group-hover:border-[#4F46E5]';

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border border-slate-100 p-10 transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
        hoverBorder
      )}
    >
      <div className="relative z-10">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-8 text-white transition-all duration-500", accentColor)}>
          <Icon size={22} />
        </div>

        <h3 className="text-[22px] font-black text-slate-900 mb-4 font-poppins tracking-[-0.02em]">{title}</h3>
        <p className="text-slate-500 leading-[1.65] mb-10 max-w-sm text-[15px]">{description}</p>

        <div className="space-y-4 mb-10">
          {features.map((feature) => (
            <div key={feature} className="flex items-center text-[13px] font-medium text-slate-600">
              <div className={cn("w-1.5 h-1.5 rounded-full mr-3 opacity-40", variant === 'teal' ? "bg-[#0F766E]" : "bg-[#4F46E5]")} />
              {feature}
            </div>
          ))}
        </div>

        <Link to="/register">
          <Button variant="outline" className={cn("w-full h-12 border-slate-200 text-slate-600 transition-all duration-300 font-semibold group", hoverBtn)}>
            Explore Solution <ArrowRight size={15} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

/* ── MAIN LANDING PAGE ── */

const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, -100]);

  // Mouse follow effect logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - 160);
    mouseY.set(e.clientY - 160);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40 !== isScrolled) setIsScrolled(latest > 40);
  });

  const handleNavClick = (e: React.MouseEvent<HTMLElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'How it Works', href: '#how-it-works' },
  ];

  return (
    <div className="min-h-screen bg-white font-inter selection:bg-[#0F766E]/10 selection:text-[#0F766E] antialiased scroll-smooth">

      {/* Subtle Background Grid */}
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
        <motion.div
          style={{
            y: bgY,
            backgroundImage: 'radial-gradient(circle, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
          className="absolute inset-0 opacity-[0.6]"
        />
      </div>

      {/* Hero Glow Follow */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="fixed top-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none z-[1] hidden lg:[@media(hover:hover)]:block transition-opacity duration-1000 will-change-transform"
      />

      {/* ── SECTION 1: NAVBAR ── */}
      <nav className={cn(
        "fixed top-0 w-full z-50 h-[60px] flex items-center transition-all duration-700",
        isScrolled 
          ? "bg-white/80 backdrop-blur-2xl border-b border-slate-100/80 shadow-[0_1px_0_rgba(0,0,0,0.04)]" 
          : "bg-transparent"
      )}>
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
          <Logo 
            size="sm" 
            customLogo={tealLogoImg} 
            className={cn(
              "transition-all duration-500",
              !isScrolled && "grayscale opacity-50"
            )} 
          />

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-8">
            <Link to="/login" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link to="/register">
              <button className="h-9 px-5 text-[13px] font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-700 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── SECTION 2: HERO ── */}
      <section
        onMouseMove={handleMouseMove}
        className="pt-[140px] pb-28 px-4 sm:px-6 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">


          {/* Left Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <FadeIn>
              <div className="inline-flex items-center gap-2 mb-8">
                <div className="h-1.5 w-6 rounded-full bg-[#0F766E]" />
                <span className="text-[11px] font-semibold text-slate-500 tracking-[0.15em] uppercase">
                  AI-Powered Workflow Generation
                </span>
              </div>
            </FadeIn>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-[56px] md:text-[72px] lg:text-[86px] font-black text-slate-900 
                         font-poppins leading-[1.0] tracking-[-0.03em] mb-8"
            >
              Architect the<br />
              <span className="text-[#0F766E]">Flow</span> of Your<br />
              Business.
            </motion.h1>

            <FadeIn delay={0.2}>
              <p className="text-[16px] text-slate-400 max-w-[420px] font-inter leading-[1.7] mb-10">
                Instantly transform natural language workflows into high-performance SaaS platforms.
                Purpose-built for Pakistani Healthcare and Education.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="flex items-center gap-6">
              <Link to="/register">
                <button className="h-12 px-8 bg-slate-900 text-white text-[14px] font-semibold rounded-md hover:bg-slate-800 transition-colors flex items-center">
                  Start Building <ArrowRight size={15} className="ml-2" />
                </button>
              </Link>
              <button 
                onClick={(e) => handleNavClick(e, '#how-it-works')}
                className="h-12 px-8 border border-slate-200 text-slate-600 text-[14px] font-semibold rounded-md hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                Watch Demo
              </button>
            </FadeIn>

            <FadeIn delay={0.4} className="mt-10 flex items-center gap-8 text-[11px] font-medium text-slate-400 tracking-wide">
              <span>No code required</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Deploy in minutes</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Full source ownership</span>
            </FadeIn>
          </div>

          {/* Right Preview */}
          <div className="lg:col-span-6 relative">
            <FadeIn delay={0.3}>
              <HeroPreview />

              {/* Floating Accents */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex items-center gap-2.5 z-20"
              >
                <Zap size={16} className="text-[#0F766E]" />
                <div>
                  <p className="text-[11px] font-medium text-slate-400 leading-none">WorkflowSpec</p>
                  <p className="text-[12px] font-semibold text-slate-700 mt-1">Generated in 12s</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex items-center gap-2.5 z-20"
              >
                <Shield size={16} className="text-[#4F46E5]" />
                <div>
                  <p className="text-[11px] font-medium text-slate-400 leading-none">Security</p>
                  <p className="text-[12px] font-semibold text-slate-700 mt-1">Verified Protocol</p>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: STATS ── */}
      <section id="features" className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <StatCounter value={60} label="Development Cost Saved" suffix="%" />
            <StatCounter value={85} label="Spec Extraction Accuracy" suffix="%" />
            <StatCounter value={0} label="Lines of Code You Write" />
            <StatCounter value="<10" label="Time to First Preview" suffix=" min" note="*based on industry benchmarks" />
          </div>
        </div>
      </section>

      {/* ── SECTION 4: SOLUTIONS ── */}
      <section id="solutions" className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <FadeIn>
              <h2 className="text-[42px] md:text-[54px] font-black text-slate-900 font-poppins 
                             leading-[1.1] tracking-[-0.02em] mb-5">
                Built for Two Worlds.
              </h2>
              <p className="text-[15px] text-slate-400 leading-relaxed">
                Industry-specific blueprints pre-configured with the standards Pakistani 
                clinics and schools actually use.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn delay={0.1}>
              <SolutionCard
                icon={Building2}
                title="Clinical Management"
                variant="teal"
                description="End-to-end patient lifecycles, appointment queues, and digital medical history management."
                features={['Patient Registry', 'SMS Notifications', 'Billing Systems']}
              />
            </FadeIn>

            <FadeIn delay={0.2}>
              <SolutionCard
                icon={SchoolIcon}
                title="Education Portals"
                variant="indigo"
                description="Comprehensive student enrollment, fee tracking, and academic progress monitoring systems."
                features={['Admission Management', 'Fee Collections', 'Progress Reports']}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Ambient Beam */}
        <div className="absolute top-[40%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0F766E]/40 to-transparent animate-[pulse_4s_ease-in-out_infinite] opacity-20" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <FadeIn>
              <h2 className="text-[42px] md:text-[54px] font-black font-poppins mb-6 tracking-[-0.02em]">The Path to Software.</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-[16px] leading-relaxed">
                We remove the technical friction between your workflow and a production-grade application.
              </p>
            </FadeIn>
          </div>

          {/* Timeline */}
          <div className="relative mb-24">
            <div className="absolute top-7 left-0 right-0 hidden md:block">
              <div className="mx-[14%] h-px bg-slate-800">
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="h-full bg-gradient-to-r from-[#0F766E] to-[#4F46E5] origin-left"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
              {[
                { step: '01', title: 'Conceptualize', icon: Bot, desc: 'Define your operational workflow in plain English. No technical jargon required.' },
                { step: '02', title: 'Architect', icon: Layout, desc: 'Our AI engine generates the full-stack architecture, database, and UI components.' },
                { step: '03', title: 'Launch', icon: Globe, desc: 'Deploy to our managed infrastructure with automated scaling and security.' }
              ].map((item, i) => (
                <FadeIn key={item.step} delay={i * 0.15}>
                  <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-8 transition-colors group-hover:border-[#0F766E]/50">
                      <item.icon size={22} className="text-[#0F766E]" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 font-poppins tracking-tight">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-[14px]">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Live Terminal */}
          <div className="max-w-2xl mx-auto">
            <FadeIn>
              <TerminalWindow />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: SOCIAL PROOF ── */}
      <section className="py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-24">
            {['Al-Shifa Medical', 'Beacon Institute', 'MediCare Clinic', 'Bright Minds Academy'].map(client => (
              <div key={client} className="px-6 py-3 border border-slate-200 rounded-md">
                <span className="text-[13px] font-bold text-slate-400 tracking-tight 
                                 hover:text-slate-700 transition-colors cursor-default">
                  {client}
                </span>
              </div>
            ))}
          </div>

          <FadeIn className="max-w-3xl mx-auto p-12 bg-slate-50 rounded-3xl relative border border-slate-100">
            <Quote size={60} className="absolute -top-8 -left-4 text-slate-100 pointer-events-none" />
            <div className="relative z-10 text-center">
              <p className="text-2xl font-medium text-slate-800 font-poppins leading-relaxed mb-10 tracking-tight">
                "FlowForge bridged the gap between our clinic's manual registers and a modern digital experience in days."
              </p>
              <div className="flex flex-col items-center">
                <p className="font-bold text-slate-900 tracking-tight">Dr. Asma Khan</p>
                <p className="text-[11px] text-[#0F766E] font-semibold uppercase tracking-[0.2em] mt-2">Director, Al-Shifa Islamabad</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── SECTION 7: CTA ── */}
      <section className="px-4 sm:px-6 pb-28">
        <div className="max-w-6xl mx-auto bg-slate-950 rounded-[40px] py-24 px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#0F766E]/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-[0.2em] mb-6 block">Ready to start?</span>
            <h2 className="text-[44px] md:text-[56px] font-black text-white font-poppins mb-10 tracking-[-0.02em] leading-tight">
              Ready to architect your flow?
            </h2>
            <p className="text-slate-400 text-[18px] mb-12 opacity-80 leading-relaxed">
              Join the growing list of Pakistani enterprises building their own software ecosystems.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register">
                <button className="h-12 px-8 bg-white text-slate-900 text-[14px] font-semibold rounded-md hover:bg-slate-100 transition-colors">
                  Get Started Free
                </button>
              </Link>
              <button className="text-[14px] font-semibold text-slate-400 hover:text-white transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FOOTER ── */}
      <footer className="bg-white border-t border-slate-100 pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-16 mb-24">

            <div className="lg:col-span-5 space-y-8">
              <Logo size="md" customLogo={tealLogoImg} className="grayscale brightness-0 opacity-80" />
              <p className="text-slate-400 text-[14px] leading-relaxed max-w-xs">
                The intelligent workflow engine for Pakistani SMEs. Building professional-grade software at the speed of thought.
              </p>
              <div className="flex gap-6">
                {[
                  { label: 'Twitter', href: 'https://twitter.com' },
                  { label: 'LinkedIn', href: 'https://linkedin.com' },
                  { label: 'GitHub', href: 'https://github.com' }
                ].map(social => (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer"
                     className="text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h4 className="text-[12px] font-semibold text-slate-900 tracking-wide">Platform</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                {['Features', 'How it Works', 'Solutions'].map(l => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={(e) => handleNavClick(e, `#${l.toLowerCase().replace(/ /g, '-')}`)} className="hover:text-slate-900">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h4 className="text-[12px] font-semibold text-slate-900 tracking-wide">Company</h4>
              <ul className="space-y-4 text-[13px] text-slate-500 font-medium">
                {['About Us', 'Contact', 'Blog'].map(l => <li key={l} className="hover:text-slate-900 cursor-pointer">{l}</li>)}
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <h4 className="text-[12px] font-semibold text-slate-900 tracking-wide">University</h4>
              <p className="text-slate-400 leading-relaxed text-[13px] font-medium">
                A research project by Maryam Farooq & Ghulam Mujtaba. COMSATS Islamabad.
              </p>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-400 tracking-wide">
            <span>© 2026 FlowForge Engine</span>
            <span>Developed with ❤️ in Islamabad</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
