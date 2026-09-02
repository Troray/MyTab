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
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium duration-0 cursor-pointer ${
          isLight
            ? `bg-black/5 hover:bg-black/10 text-slate-900 ${isOpen ? 'border-black/30 ring-2 ring-black/10' : 'border-black/10'}`
            : `bg-white/10 hover:bg-white/15 text-white ${isOpen ? 'border-white/30 ring-2 ring-white/20' : 'border-white/15'}`
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 opacity-60 duration-0 shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] max-h-56 overflow-y-auto rounded-2xl border shadow-2xl z-50 animate-scale-in p-1.5 scrollbar-thin ${
            isLight
              ? 'border-black/10 shadow-black/15 bg-white/95 text-slate-900'
              : 'border-white/15 shadow-black/80 bg-slate-900/95 text-white'
          }`}
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs sm:text-sm duration-0 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-black/5 text-black font-semibold'
                      : 'bg-white/15 text-white font-semibold'
                    : isLight
                    ? 'text-slate-700 hover:bg-black/5 hover:text-black'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {option.icon}
                  {option.label}
                </span>
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ml-2 ${
                      isLight ? 'text-amber-600' : 'text-amber-400'
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
