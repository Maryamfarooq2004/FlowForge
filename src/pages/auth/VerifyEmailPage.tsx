import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MailCheck, MailWarning, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { useVerifyEmail, useResendVerification } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

type Status = 'verifying' | 'success' | 'expired';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams();
  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'expired');
  const ranRef = useRef(false);

  useEffect(() => {
    // The verification token is single-use — guard against React StrictMode's
    // double-invoke in dev, which would otherwise consume the token twice and
    // report a false "expired" on the second call.
    if (!token || ranRef.current) return;
    ranRef.current = true;

    verifyEmail
      .mutateAsync(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('expired'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {status === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Loader2 size={40} className="text-[#0F766E] animate-spin mb-4" />
            <h2 className="text-lg font-bold text-slate-800 font-poppins">
              Verifying your email…
            </h2>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MailCheck size={40} className="text-[#0F766E]" />
            </div>
            <h2 className="text-[24px] font-bold text-slate-900 font-poppins mb-3">
              Email verified!
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Thanks for confirming your address. Your FlowForge account is now fully verified.
            </p>
            <Link to={isAuthenticated ? '/hub' : '/login'} className="block">
              <Button className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold">
                {isAuthenticated ? 'Go to your workspace →' : 'Log in to FlowForge →'}
              </Button>
            </Link>
          </motion.div>
        )}

        {status === 'expired' && (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="bg-amber-50 rounded-xl p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <MailWarning size={32} className="text-amber-500" />
            </div>
            <h2 className="text-[24px] font-bold text-slate-900 font-poppins mb-3">
              This link is invalid or expired
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Verification links are valid for 24 hours. {isAuthenticated
                ? 'Request a fresh one below.'
                : 'Log in and we’ll help you resend a new one.'}
            </p>
            {isAuthenticated ? (
              <Button
                onClick={() => resend.mutate()}
                isLoading={resend.isPending}
                className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold"
              >
                Resend verification email →
              </Button>
            ) : (
              <Link to="/login" className="block">
                <Button className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold">
                  Go to login →
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
