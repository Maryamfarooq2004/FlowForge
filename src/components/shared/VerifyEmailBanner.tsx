import React from 'react';
import { MailWarning } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useResendVerification } from '../../hooks/useAuth';

/**
 * Persistent "verify your email" banner (soft gate). Shown across the app while
 * the logged-in user's email is unverified; auto-hides once verified. The Resend
 * button re-issues a verification email.
 */
export const VerifyEmailBanner: React.FC = () => {
  const { user } = useAuthStore();
  const resend = useResendVerification();

  // Only render for a logged-in, explicitly-unverified user.
  if (!user || user.isEmailVerified !== false) return null;

  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="bg-amber-100 rounded-full p-1.5 shrink-0">
          <MailWarning className="text-amber-600 h-5 w-5" />
        </span>
        <p className="text-sm text-amber-800 leading-snug">
          <span className="font-semibold">Verify your email.</span>{' '}
          We sent a link to <span className="font-semibold">{user.email}</span> — click it to
          unlock everything.
        </p>
      </div>
      <button
        type="button"
        onClick={() => resend.mutate()}
        disabled={resend.isPending}
        aria-label="Resend verification email"
        className="shrink-0 self-start sm:self-auto text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 disabled:opacity-50"
      >
        {resend.isPending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
