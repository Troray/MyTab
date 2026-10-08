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
  columns?: number;
  menuWidth?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  isLight = false,
  placeholder = 'Select...',
  className = '',
  columns = 1,
  menuWidth,
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
          className={`glass-dropdown absolute top-[calc(100%+6px)] rounded-2xl border shadow-2xl z-50 animate-scale-in p-1.5 ${
            columns > 1
              ? `${menuWidth || 'w-[320px] sm:w-[340px]'} right-0 max-h-[80vh] overflow-y-auto scrollbar-thin`
              : 'left-0 right-0 max-h-56 overflow-y-auto scrollbar-thin'
          } ${
            isLight
              ? 'border-black/10 shadow-black/15 text-slate-900'
              : 'border-white/15 shadow-black/40 text-white'
          }`}
        >
          <div
            className={
              columns === 2
                ? 'grid grid-cols-2 gap-1'
                : columns === 3
                ? 'grid grid-cols-3 gap-1'
                : 'space-y-0.5'
            }
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left ${
                    columns > 1 ? 'text-xs' : 'text-xs sm:text-sm'
                  } duration-0 cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-black/5 text-black font-semibold'
                        : 'bg-white/15 text-white font-semibold'
                      : isLight
                      ? 'text-slate-700 hover:bg-black/5 hover:text-black'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ml-1.5 ${
                        isLight ? 'text-amber-600' : 'text-amber-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
