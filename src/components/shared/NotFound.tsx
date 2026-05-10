import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Logo } from './Logo';
import { ArrowLeft, Home, FileWarning, Search, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 text-[#0F766E]"
        >
          <Code2 size={48} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 text-[#4F46E5]"
        >
          <Search size={64} />
        </motion.div>
        <motion.div 
          animate={{ rotate: [0, 10, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-1/3 text-[#0F766E]"
        >
          <FileWarning size={40} />
        </motion.div>
      </div>

      <div className="mb-12 relative z-10">
        <Logo size="lg" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-lg"
      >
        <h1 className="text-8xl md:text-[120px] font-black font-poppins text-transparent bg-clip-text bg-gradient-to-br from-[#0F766E] to-[#4F46E5] mb-6 leading-none">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 font-poppins mb-4">
          Page not found
        </h2>
        <p className="text-slate-500 mb-10 text-lg">
          The page you're looking for doesn't exist, has been moved, or you don't have access to it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-12 px-6 flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </Button>
          <Button 
            className="w-full sm:w-auto h-12 px-6 flex items-center space-x-2 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold shadow-lg shadow-teal-900/10"
            onClick={() => navigate('/hub')}
          >
            <Home size={18} />
            <span>Go to Project Hub</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
