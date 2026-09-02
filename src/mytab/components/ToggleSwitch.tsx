import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isLight: boolean;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  isLight,
  disabled = false,
}) => {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
        aria-checked={checked}
      />
      <div
        className={`w-9 h-5 rounded-full duration-0 peer peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
          isLight ? 'peer-focus-visible:ring-slate-900 peer-focus-visible:ring-offset-white' : 'peer-focus-visible:ring-white peer-focus-visible:ring-offset-slate-900'
        } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:duration-0 ${
          isLight
            ? 'bg-slate-300 peer-checked:bg-slate-900'
            : 'bg-white/20 peer-checked:bg-white after:peer-checked:bg-slate-900'
        }`}
      />
    </label>
  );
};
