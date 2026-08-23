import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  isLight?: boolean;
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  isLight = false,
  placeholder = '请选择',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
          isLight
            ? `bg-black/5 hover:bg-black/10 text-slate-900 ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-black/10'}`
            : `bg-white/10 hover:bg-white/15 text-white ${isOpen ? 'border-white/30 ring-1 ring-white/20' : 'border-white/15'}`
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 opacity-70 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Frosted Glass Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] max-h-56 overflow-y-auto rounded-2xl border shadow-2xl z-50 animate-scale-in p-1.5 scrollbar-thin ${
            isLight
              ? 'border-black/10 shadow-black/15'
              : 'border-white/20 shadow-black/60'
          }`}
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(30, 32, 40, 0.75)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'bg-white/20 text-white font-semibold shadow-sm'
                    : isLight
                    ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {option.icon}
                  {option.label}
                </span>
                {isSelected && (
                  <Check
                    className={`w-4 h-4 shrink-0 ml-2 ${
                      isLight ? 'text-indigo-600' : 'text-indigo-300'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
