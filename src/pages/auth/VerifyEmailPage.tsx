import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import axiosInstance from '../../services/api/axiosInstance';

const VerifyEmailPage: React.FC = () => {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!token || hasCalled.current) return;

    const verifyToken = async () => {
      hasCalled.current = true;
      try {
        await axiosInstance.get(`/api/v1/auth/verify-email?token=${token}`);
        setState('success');
      } catch (error: any) {
        setState('error');
        setErrorMsg(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setIsResending(true);
    try {
      await axiosInstance.post('/api/v1/auth/resend-verification', { email });
      toast.success('Verification link sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend link');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden"
      >
        <div className="h-1.5 w-24 bg-[#0F766E] rounded-full mx-auto mt-10" />
        
        <div className="p-10 pt-8 flex flex-col items-center text-center">
          <Logo size="md" variant="color" className="mb-10" useSecondary={true} />

          {state === 'loading' && (
            <div className="py-8 space-y-4">
              <Loader2 className="h-12 w-12 text-[#0F766E] animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 font-poppins">Verifying your email...</h2>
              <p className="text-slate-500">Please wait while we activate your account.</p>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-6">
              <div className="h-20 w-20 rounded-full border-2 border-[#0F766E] flex items-center justify-center mx-auto text-[#0F766E]">
                <CheckCircle2 size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 font-poppins">Your account is verified! ✅</h2>
                <p className="text-slate-600">
                  Welcome to FlowForge. Your account is now active.
                </p>
              </div>

              <Link to="/login" className="block w-full pt-4">
                <Button className="w-full h-12 text-base font-semibold">
                  Go to Login →
                </Button>
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-6 w-full">
              <div className="h-20 w-20 rounded-full border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-500">
                <Clock size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 font-poppins">Verification failed</h2>
                <p className="text-slate-600">
                  {errorMsg}.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-4 w-full pt-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to resend link"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none transition-all"
                  />
                </div>
                <Button type="submit" isLoading={isResending} className="w-full h-12 text-base font-semibold">
                  Resend Verification Email
                </Button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
      
      <div className="mt-8 text-sm text-slate-400 flex items-center space-x-2">
        <span>Need help?</span>
        <button className="text-[#0F766E] font-medium hover:underline">Contact Support</button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
