import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const CheckEmailPage: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email address';

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
        <div className="bg-teal-50 text-[#0F766E] p-4 rounded-full">
          <Mail size={48} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-[26px] font-bold text-slate-900 font-poppins">Check your email</h2>
          <p className="text-slate-500 font-inter max-w-sm">
            We've sent a verification link to <span className="font-semibold text-slate-700">{email}</span>. 
            Please click the link in the email to activate your account.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-slate-400 mb-4">
            Didn't receive the email? Check your spam folder or try registering again if you made a typo.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Back to Login <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CheckEmailPage;
