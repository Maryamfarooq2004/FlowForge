import React from 'react';
import { Spinner } from '../ui/Spinner';

const LoadingScreen: React.FC = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
    <Spinner className="h-10 w-10 text-[#0F766E]" />
  </div>
);

export default LoadingScreen;
