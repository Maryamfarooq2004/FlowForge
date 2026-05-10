import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Bot, Rocket, Building2, School, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => setStep(prev => prev + 1);

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full mx-auto text-center mt-10"
            >
              <motion.div 
                initial={{ scale: 0.8, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="bg-[#0F766E] rounded-2xl p-5 w-24 h-24 mx-auto flex items-center justify-center shadow-xl shadow-teal-900/20 mb-8"
              >
                <Sparkles size={40} className="text-white" />
              </motion.div>

              <h1 className="text-[40px] md:text-[48px] font-black text-slate-900 font-poppins mb-6 leading-tight">
                Welcome to FlowForge, <span className="text-[#0F766E]">Dr. Sara!</span> 👋
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed">
                You're moments away from turning your clinic's workflow into a fully working application — no code required.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
                {[
                  { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100", title: "Describe your workflow", desc: "Just talk us through your process in plain English." },
                  { icon: Bot, color: "text-purple-600", bg: "bg-purple-100", title: "AI builds your app", desc: "Our AI extracts your requirements and generates the full codebase." },
                  { icon: Rocket, color: "text-teal-600", bg: "bg-teal-100", title: "Deploy in hours", desc: "Get a live, customized application — not a generic template." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5", feature.bg)}>
                      <feature.icon size={24} className={feature.color} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 font-poppins">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center"
              >
                <Button 
                  onClick={handleNext}
                  className="h-14 px-12 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold text-lg rounded-xl shadow-xl shadow-teal-900/20 hover:scale-105 transition-transform"
                >
                  Let's build your first app →
                </Button>
                <button 
                  onClick={() => navigate('/hub')}
                  className="mt-6 text-sm text-slate-400 font-medium hover:text-slate-600 transition-colors"
                >
                  Skip introduction
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: How it works */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-5xl w-full mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 font-poppins mb-3">How the magic happens</h2>
                <p className="text-slate-500">Three simple steps from conversation to deployment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-slate-50 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-100">
                  <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-slate-200/50 font-poppins leading-none select-none z-0">1</div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-slate-900 text-xl mb-4 font-poppins text-[#0F766E]">Describe</h3>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
                      <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                      <div className="h-2 w-full bg-slate-200 rounded-full" />
                      <div className="h-2 w-5/6 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-100">
                  <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-slate-200/50 font-poppins leading-none select-none z-0">2</div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-slate-900 text-xl mb-4 font-poppins text-indigo-600">AI Extracts</h3>
                    <div className="bg-white rounded-lg shadow-sm border border-indigo-100 p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <div className="h-2 w-1/2 bg-indigo-100 rounded-full" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                        <div className="h-2 w-2/3 bg-indigo-100 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-100">
                  <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-slate-200/50 font-poppins leading-none select-none z-0">3</div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-slate-900 text-xl mb-4 font-poppins text-emerald-600">Your App</h3>
                    <div className="bg-white rounded-t-lg shadow-sm border border-slate-200 p-2 border-b-0 h-24 flex flex-col">
                      <div className="flex space-x-1 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded border border-slate-100" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleNext}
                  className="h-14 px-12 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold text-lg rounded-xl shadow-xl shadow-teal-900/20"
                >
                  I'm ready →
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Domain Selection */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl w-full mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 font-poppins mb-3">What type of business do you run?</h2>
                <p className="text-slate-500">This helps our AI tailor the initial workflow templates.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <button
                  onClick={() => navigate('/project/new/domain')}
                  className="bg-white border-2 border-slate-200 hover:border-[#0F766E] rounded-2xl p-8 text-left transition-all hover:shadow-lg group flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Building2 size={40} className="text-[#0F766E]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl font-poppins mb-2">Medical Clinic</h3>
                  <p className="text-slate-500 text-sm">Patient intake, appointments, and medical records management.</p>
                </button>

                <button
                  onClick={() => navigate('/project/new/domain')}
                  className="bg-white border-2 border-slate-200 hover:border-[#4F46E5] rounded-2xl p-8 text-left transition-all hover:shadow-lg group flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <School size={40} className="text-[#4F46E5]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl font-poppins mb-2">Educational School</h3>
                  <p className="text-slate-500 text-sm">Student enrollment, class scheduling, and parent communications.</p>
                </button>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => navigate('/project/new/domain')}
                  className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl"
                >
                  Create my first project <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress Dots */}
      <div className="pb-10 pt-4 flex justify-center space-x-3 z-20">
        {[1, 2, 3].map((dot) => (
          <div 
            key={dot}
            className={cn(
              "h-2.5 rounded-full transition-all duration-500",
              step >= dot ? "w-8 bg-[#0F766E]" : "w-2.5 bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingPage;
