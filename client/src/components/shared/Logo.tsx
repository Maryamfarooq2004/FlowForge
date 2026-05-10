import React from 'react';
import { cn } from '../../utils/classNames';
import logoImg from '../../assets/image.png';
import logo2Img from '../../assets/logo2.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
  showText?: boolean;
  useSecondary?: boolean;
  customLogo?: string;
}

const sizeClasses = {
  sm: 'h-10',
  md: 'h-16',
  lg: 'h-[min(16rem,35vh)]', // Scale with viewport height to avoid overflow
  xl: 'h-[min(20rem,45vh)]',
};

/**
 * Logo Component
 * Supports switching between primary (image.png) and secondary (logo2.png) branding.
 */
export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  variant = 'color',
  showText = true,
  useSecondary = false,
  customLogo
}) => {
  const currentLogo = customLogo || (useSecondary ? logo2Img : logoImg);
  
  return (
    <div className={cn('flex items-center shrink-0', className)}>
      <img 
        src={currentLogo} 
        alt="FlowForge Logo" 
        className={cn(
          "object-contain transition-transform duration-500 hover:scale-105",
          sizeClasses[size],
          variant === 'dark' ? "brightness-0" : "" 
        )}
      />
      
      {showText && (
        <span className={cn(
          'font-poppins font-bold tracking-tight select-none ml-3 hidden',
          size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : size === 'lg' ? 'text-6xl' : 'text-8xl',
          variant === 'light' ? 'text-white' : 'text-slate-900'
        )}>
          FlowForge
        </span>
      )}
    </div>
  );
};
