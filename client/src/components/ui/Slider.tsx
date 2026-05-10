import React, { useState } from 'react';
import { cn } from '../../utils/classNames';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  label?: string;
  tooltipPrefix?: string;
  tooltipSuffix?: string;
  markers?: { value: number; label: string }[];
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  defaultValue = 0,
  onChange,
  className,
  tooltipPrefix = '',
  tooltipSuffix = '',
  markers = []
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full py-8", className)}>
      <div className="relative mb-6">
        {/* Tooltip */}
        <div 
          className="absolute -top-10 left-0 -translate-x-1/2 bg-[#0F766E] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
          style={{ left: `${percentage}%` }}
        >
          {tooltipPrefix}{value}{tooltipSuffix}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F766E] rotate-45" />
        </div>

        {/* Track */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full">
          <div 
            className="h-full bg-[#0F766E] rounded-full relative" 
            style={{ width: `${percentage}%` }}
          >
            {/* Thumb - Handled by input but visual here if needed */}
          </div>
        </div>

        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer z-10"
        />

        {/* Visual Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 bg-[#0F766E] border-4 border-white rounded-full shadow-md pointer-events-none"
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Markers */}
      {markers.length > 0 && (
        <div className="flex justify-between px-1">
          {markers.map((marker) => (
            <div key={marker.value} className="flex flex-col items-center">
              <div className="h-1 w-[1px] bg-slate-300 mb-2" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {marker.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
