import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Logo } from './Logo';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const RouteError: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred in the application.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || "We couldn't find what you were looking for.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative font-inter">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
        <AlertTriangle size={800} />
      </div>

      <div className="absolute top-8 left-8">
        <Logo size="md" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 relative z-10 border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-black font-poppins text-slate-900 mb-3">
          {title}
        </h1>
        
        <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto">
          {message}
        </p>

        {status === 500 && error instanceof Error && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-left overflow-x-auto">
            <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
              {error.stack || error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-12 px-6 flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw size={18} />
            <span>Reload Page</span>
          </Button>
          <Button 
            className="w-full sm:w-auto h-12 px-6 flex items-center space-x-2 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold shadow-lg shadow-teal-900/10"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
            <span>Go to Home</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RouteError;
