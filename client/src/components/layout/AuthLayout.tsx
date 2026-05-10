import { motion } from 'framer-motion';
import { Box, Stethoscope, GraduationCap } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../shared/Logo';
import { Footer } from './Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F8FAFC] overflow-hidden">
      {/* Left Panel - Dark Hero */}
      <div className="relative hidden md:flex md:w-[55%] bg-[#0F2744] overflow-hidden p-12 flex-col items-center justify-center h-full">
        {/* Subtle Background Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#0F2744]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#34D399] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        {/* Floating Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.07]">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 100, y: Math.random() * 100 }}
              animate={{
                x: [Math.random() * 100, Math.random() * 200, Math.random() * 100],
                y: [Math.random() * 100, Math.random() * 200, Math.random() * 100]
              }}
              transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
              className="absolute text-white"
            >
              <div className="h-12 w-12 border-2 border-white rounded-lg" />
            </motion.div>
          ))}
        </div>

        {/* Content Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Logo size="lg" variant="light" className="mb-6" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-3xl lg:text-4xl font-bold text-white font-poppins leading-[1.1] mb-3 tracking-tight"
          >
            Architecting the <span className="text-[#34D399]">flow</span> of your organization.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-slate-300 text-sm lg:text-base font-inter leading-relaxed max-w-md mb-8 opacity-90"
          >
            Seamlessly transition between industry-specific workflows with precision and grace.
          </motion.p>

          {/* Mini Preview Cards - Minimal Style as per Image 1 & 2 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex space-x-4 w-full max-w-lg"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 flex-1 text-left transition-all hover:bg-white/[0.06] hover:scale-[1.02]">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-[#0F766E] p-1.5 rounded-lg text-[#34D399]">
                  <Stethoscope size={16} />
                </div>
                <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] leading-tight">Clinic Patient<br/>Flow</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#34D399] to-[#0F766E]" 
                />
              </div>
            </div>
            
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 flex-1 text-left transition-all hover:bg-white/[0.06] hover:scale-[1.02]">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-blue-600/40 p-1.5 rounded-lg text-blue-300">
                  <GraduationCap size={16} />
                </div>
                <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] leading-tight">Admin<br/>Pipeline</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header Nav */}
        <div className="p-4 flex justify-end space-x-6 text-sm font-medium text-slate-500">
          <Link to="/hub/support" className="hover:text-slate-800 transition-colors">Contact Support</Link>
          <Link to="/hub/support" className="hover:text-slate-800 transition-colors">Help</Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px]"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
              <div className="mb-6">
                <div className="bg-[#0F766E] rounded-xl p-2.5 w-11 h-11 flex items-center justify-center mb-4">
                  <Box className="text-white h-5 w-5" />
                </div>
                {children}
              </div>
            </div>
          </motion.div>
        </div>

        <Footer className="border-t-0 bg-transparent py-8 opacity-60" />
      </div>
    </div>
  );
};
