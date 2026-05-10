import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Timer for lockout
  React.useEffect(() => {
    let interval: any;
    if (lockoutTimeLeft > 0) {
      interval = setInterval(() => {
        setLockoutTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimeLeft === 0 && failedAttempts >= 5) {
      setFailedAttempts(0); // Reset after timer ends
    }
    return () => clearInterval(interval);
  }, [lockoutTimeLeft, failedAttempts]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (lockoutTimeLeft > 0) return;
    setLoginError(null);
    try {
      await login(data);
      // For this demo, we'll navigate to hub
      navigate('/hub');
    } catch (error: any) {
      const code = error.response?.data?.code;
      const message = error.response?.data?.error || 'INVALID EMAIL OR PASSWORD';
      
      switch (code) {
        case 'ACCOUNT_LOCKED':
          setLockoutTimeLeft(15 * 60);
          setFailedAttempts(5);
          setLoginError(null);
          break;
        case 'RATE_LIMITED':
          toast.error(message);
          setLoginError(message.toUpperCase());
          break;
        case 'INVALID_CREDENTIALS':
        default:
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          
          if (newAttempts >= 5 || message.includes('locked')) {
            setLockoutTimeLeft(15 * 60);
            setLoginError(null);
          } else {
            setLoginError(message.toUpperCase());
          }
      }
    }
  };

  const isLocked = failedAttempts >= 5 && lockoutTimeLeft > 0;

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col h-full justify-center"
          >
            <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Lock size={32} className="text-red-500" />
            </div>

            <h2 className="text-[22px] font-bold text-slate-800 text-center font-poppins mb-2">
              Account temporarily locked
            </h2>
            <p className="text-center text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              For your security, this account has been locked after 5 failed login attempts.
            </p>

            <div className="bg-slate-50 rounded-xl px-6 py-6 text-center mt-2 shadow-inner border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-2">
                Account unlocks in:
              </p>
              <div className="text-[48px] font-bold text-[#0F766E] font-poppins leading-none tracking-tight mb-1">
                {formatTime(lockoutTimeLeft)}
              </div>
              <p className="text-xs text-slate-400">(minutes : seconds)</p>
            </div>

            <div className="mt-8 text-center space-y-4">
              <AnimatePresence>
                {lockoutTimeLeft === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button 
                      onClick={() => setFailedAttempts(0)}
                      className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold"
                    >
                      Try again →
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <Link to="/forgot-password" className="text-sm font-semibold text-[#0F766E] hover:underline inline-block">
                Forgot your password?
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="space-y-1">
              <h2 className="text-[26px] font-bold text-slate-900 font-poppins">Welcome back</h2>
              <p className="text-sm text-slate-500 font-inter">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <AnimatePresence>
          {loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center space-x-3 text-red-700 overflow-hidden"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {loginError}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <Input
            label="EMAIL ADDRESS"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            {...register('email')}
            variant={errors.email ? 'error' : 'default'}
            errorMessage={errors.email?.message}
            className="font-poppins"
          />

          <div className="relative">
            <Input
              label="PASSWORD"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              variant={errors.password ? 'error' : 'default'}
              errorMessage={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-[#0F766E] hover:underline">
            Forgot password? Reset here.
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-semibold text-base shadow-lg shadow-teal-700/20"
        >
          {isLoading ? 'Signing in...' : 'Login to Dashboard'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0F766E] font-bold hover:underline">
            Sign up now
          </Link>
        </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default LoginPage;
