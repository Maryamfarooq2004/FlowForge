import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmittedEmail(data.email);
    setIsSubmitted(true);
  };

  const handleResend = () => {
    if (resendCount >= 3) return;
    setResendCount((prev) => prev + 1);
  };

  return (
    <AuthLayout>
      <Link 
        to="/login" 
        className="inline-flex items-center text-sm font-semibold text-[#0F766E] hover:underline mb-8"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Login
      </Link>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-blue-50 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
              <Mail size={28} className="text-blue-600" />
            </div>

            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 font-poppins">Forgot your password?</h2>
              <p className="text-sm text-slate-500 font-inter">
                Enter your registered email and we'll send you a secure reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="BUSINESS EMAIL"
                  type="email"
                  placeholder="sara@alshifaclinic.com"
                  autoComplete="email"
                  {...register('email')}
                  variant={errors.email ? 'error' : 'default'}
                  errorMessage={errors.email?.message}
                />
                <p className="text-xs text-slate-400">
                  We'll only send the link if this email is registered with FlowForge.
                </p>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold shadow-md transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link →'}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>

              <h2 className="text-[22px] font-bold text-slate-800 font-poppins mb-3">
                Check your inbox
              </h2>
              
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                A reset link has been sent to <span className="font-semibold text-slate-800">{submittedEmail}</span> — valid for 1 hour.
              </p>

              <div className="text-sm text-slate-500">
                Didn't receive it?{' '}
                {resendCount >= 3 ? (
                  <span className="text-slate-400 block mt-2">
                    Please wait 1 hour before trying again.
                  </span>
                ) : (
                  <button 
                    onClick={handleResend}
                    className="text-[#0F766E] font-bold hover:underline ml-1"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
              For security, we never confirm whether an email is registered.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
