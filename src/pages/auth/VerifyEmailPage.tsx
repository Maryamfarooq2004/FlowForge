import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

import axiosInstance from '../../services/api/axiosInstance';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<'loading' | 'success' | 'expired'>('loading');

  useEffect(() => {
    if (!token) {
      setState('expired');
      return;
    }

    const verifyToken = async () => {
      try {
        await axiosInstance.get(`/api/v1/auth/verify-email?token=${token}`);
        setState('success');
      } catch (error) {
        setState('expired');
      }
    };

    verifyToken();
  }, [token]);

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
                  Welcome to FlowForge, Dr. Sara Ahmed. Your Al-Shifa Clinic account is now active.
                </p>
                <p className="text-sm italic text-slate-400 pt-2">
                  You registered with sara@alshifaclinic.com
                </p>
              </div>

              <Link to="/login" className="block w-full pt-4">
                <Button className="w-full h-12 text-base font-semibold">
                  Go to Login →
                </Button>
              </Link>
            </div>
          )}

          {state === 'expired' && (
            <div className="space-y-6">
              <div className="h-20 w-20 rounded-full border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-500">
                <Clock size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 font-poppins">Verification link expired</h2>
                <p className="text-slate-600">
                  This link has expired. Request a new one below.
                </p>
              </div>

              <div className="space-y-4 w-full pt-4">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  Resend Verification Email
                </Button>
                <p className="text-xs text-slate-400">
                  Maximum attempts reached. Try again in 14:59.
                </p>
              </div>
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
