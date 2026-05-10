import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Building2, School, ChevronDown } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  organizationType: z.enum(['clinic', 'school'], {
    required_error: 'Please select an organization type'
  }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number')
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationType: undefined
    }
  });

  const passwordValue = watch('password') || '';
  
  React.useEffect(() => {
    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/[0-9]/.test(passwordValue)) strength++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;
    setPasswordStrength(strength);
  }, [passwordValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError(null);
      const response = await authService.register(data);
      
      if (response.data.success) {
        toast.success('Account created! Please log in to continue.');
        navigate('/login');
      }
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed.';
      
      switch (code) {
        case 'EMAIL_EXISTS':
        case 'EMAIL_ALREADY_EXISTS':
          setError('email', { message: 'An account with this email already exists.' });
          break;
        case 'INVALID_EMAIL':
        case 'INVALID_EMAIL_FORMAT':
          setError('email', { message: 'Please enter a valid email address.' });
          break;
        case 'WEAK_PASSWORD':
          setError('password', { message: message });
          break;
        case 'MISSING_FIELDS':
          toast.error('Please fill in all required fields.');
          break;
        case 'RATE_LIMITED':
          toast.error('Too many attempts. Please wait and try again.');
          break;
        default:
          setServerError(message);
          toast.error(message);
      }
    }
  };

  const strengthLabels = ['WEAK', 'FAIR', 'GOOD', 'STRONG'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <AuthLayout>
      <div className="space-y-1">
        <h2 className="text-[26px] font-bold text-slate-900 font-poppins">Create Account</h2>
        <p className="text-sm text-slate-500 font-inter">Join the next evolution of workflow management.</p>
      </div>

      {serverError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2.5">
        <Input
          label="FULL NAME"
          placeholder="Alex Rivera"
          autoComplete="name"
          {...register('fullName')}
          variant={errors.fullName ? 'error' : 'default'}
          errorMessage={errors.fullName?.message}
        />

        <Input
          label="BUSINESS EMAIL"
          type="email"
          placeholder="alex@company.com"
          autoComplete="email"
          {...register('email')}
          variant={errors.email ? 'error' : 'default'}
          errorMessage={errors.email?.message}
        />

        <div className="space-y-0.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            ORGANIZATION TYPE
          </label>
          <div className="relative">
            <select
              {...register('organizationType')}
              className={cn(
                "appearance-none w-full border border-[#E2E8F0] rounded-lg h-11 px-10 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all bg-white text-slate-700",
                errors.organizationType && "border-[#DC2626] ring-red-100"
              )}
            >
              <option value="">Select organization type</option>
              <option value="clinic">Medical Clinic</option>
              <option value="school">Educational School</option>
            </select>
            <div className="absolute left-3 top-3 text-slate-400">
              {watch('organizationType') === 'school' ? <School size={20} /> : <Building2 size={20} />}
            </div>
            <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
              <ChevronDown size={20} />
            </div>
          </div>
          {errors.organizationType && <p className="text-xs text-[#DC2626]">{errors.organizationType.message}</p>}
          <p className="text-[11px] text-slate-400">
            Your selection will configure default workflows for your business type.
          </p>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              label="PASSWORD"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              variant={errors.password ? 'error' : 'default'}
              errorMessage={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* Strength Indicator */}
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 flex space-x-1 h-1">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-full transition-all duration-300",
                    i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <span className={cn(
              "text-[10px] font-bold tracking-wider",
              passwordStrength > 0 ? "text-slate-700" : "text-slate-300"
            )}>
              {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "STRENGTH"}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-semibold text-base mt-4"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0F766E] font-bold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
