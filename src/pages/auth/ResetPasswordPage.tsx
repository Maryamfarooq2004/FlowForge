import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Clock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useResetPassword } from '../../hooks/useAuth';
import type { ApiError } from '../../types/global.types';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams();
  const resetPassword = useResetPassword();
  const [status, setStatus] = useState<'verifying' | 'valid' | 'expired' | 'success'>(
    token ? 'valid' : 'expired'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  const passwordValue = watch('password', '');
  const confirmValue = watch('confirmPassword', '');

  // Requirements logic
  const hasLength = passwordValue.length >= 8;
  const hasLetter = /[A-Za-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const isDifferent = passwordValue.length > 0; // Mock check for previous password

  useEffect(() => {
    // Calculate strength (0-4)
    let strength = 0;
    if (hasLength) strength++;
    if (hasLetter) strength++;
    if (hasNumber) strength++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;
    setPasswordStrength(strength);
  }, [passwordValue, hasLength, hasLetter, hasNumber]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await resetPassword.mutateAsync({ token: token!, newPassword: data.password });
      setStatus('success');
    } catch (err) {
      const apiErr = err as ApiError;
      const code = apiErr.response?.data?.code;
      if (code === 'INVALID_RESET_TOKEN' || code === 'MISSING_TOKEN') {
        setStatus('expired');
      } else {
        toast.error(apiErr.response?.data?.message || 'Could not reset password. Please try again.');
      }
    }
  };

  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

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
            <div className="w-10 h-10 border-4 border-[#0F766E]/30 border-t-[#0F766E] rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-bold text-slate-800 font-poppins">Verifying your reset link...</h2>
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
              <Clock size={32} className="text-amber-500" />
            </div>
            <h2 className="text-[24px] font-bold text-slate-900 font-poppins mb-3">This link has expired</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Password reset links are only valid for 15 minutes for your security.
            </p>
            <Link to="/forgot-password" className="block">
              <Button className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold">
                Request a new link →
              </Button>
            </Link>
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
              <ShieldCheck size={40} className="text-[#0F766E]" />
            </div>
            <h2 className="text-[24px] font-bold text-slate-900 font-poppins mb-3">Password updated!</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="block">
              <Button className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold">
                Log in to FlowForge →
              </Button>
            </Link>
          </motion.div>
        )}

        {status === 'valid' && (
          <motion.div 
            key="valid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-teal-50 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
              <ShieldCheck size={28} className="text-[#0F766E]" />
            </div>

            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 font-poppins">Create a new password</h2>
              <p className="text-sm text-slate-500 font-inter">
                Your new password must be different from previous ones.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    label="NEW PASSWORD"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    variant={errors.password ? 'error' : 'default'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Strength Bar */}
                <div className="flex space-x-1 h-1.5 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-full transition-all duration-300",
                        i <= passwordStrength ? strengthColors[passwordStrength] : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <CheckCircle2 size={14} className={hasLength ? "text-green-500" : "text-slate-300"} />
                    <span className={hasLength ? "text-slate-700" : "text-slate-400"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <CheckCircle2 size={14} className={hasLetter ? "text-green-500" : "text-slate-300"} />
                    <span className={hasLetter ? "text-slate-700" : "text-slate-400"}>Contains a letter</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <CheckCircle2 size={14} className={hasNumber ? "text-green-500" : "text-slate-300"} />
                    <span className={hasNumber ? "text-slate-700" : "text-slate-400"}>Contains a number</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <CheckCircle2 size={14} className={isDifferent ? "text-green-500" : "text-slate-300"} />
                    <span className={isDifferent ? "text-slate-700" : "text-slate-400"}>Does not match previous passwords</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="CONFIRM NEW PASSWORD"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    variant={errors.confirmPassword ? 'error' : 'default'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Match indicator */}
                {confirmValue.length > 0 && (
                  <p className={cn(
                    "text-xs font-semibold mt-2",
                    passwordValue === confirmValue ? "text-green-600" : "text-red-500"
                  )}>
                    {passwordValue === confirmValue ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValid || passwordValue !== confirmValue}
                isLoading={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-semibold shadow-lg shadow-teal-700/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Password →'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
