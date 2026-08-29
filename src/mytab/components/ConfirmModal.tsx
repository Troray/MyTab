import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, AlertCircle, X } from 'lucide-react';
import { t } from '../../utils/i18n';
import { Locale } from '../../utils/i18n';

export type ConfirmType = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  type?: ConfirmType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  language?: Locale;
  isLight?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type = 'danger',
  title,
  message,
  confirmText,
  cancelText,
  language = 'zh-CN',
  isLight: propsIsLight,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      } else if (
        e.key === 'Enter' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'BUTTON'
      ) {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="p-3 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/25 shadow-sm">
            <Trash2 className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="p-3 rounded-2xl bg-slate-500/15 text-slate-300 border border-slate-500/25 shadow-sm">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  const isLight = propsIsLight ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));

  const confirmBtnClass =
    type === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
      : type === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
      : isLight
      ? 'bg-slate-900 hover:bg-black text-white'
      : 'bg-white hover:bg-slate-100 text-slate-950 font-semibold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Frosted Glass Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div
        className={`glass-modal relative w-full max-w-md rounded-3xl border shadow-2xl p-6 overflow-hidden animate-scale-in transition-all ${
          isLight
            ? 'border-black/10 text-slate-900 shadow-black/15'
            : 'border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-400 hover:text-slate-800 hover:bg-black/5'
              : 'text-white/40 hover:text-white hover:bg-white/10'
          }`}
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="shrink-0">{renderIcon()}</div>
          <div className="space-y-1 pr-6 flex-1">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-white/70'
              }`}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-slate-700'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
            }`}
          >
            {cancelText || t('cancel', language)}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isLight ? 'focus-visible:ring-offset-white focus-visible:ring-slate-900' : 'focus-visible:ring-offset-[#1E1E1E] focus-visible:ring-white/50'
            } ${confirmBtnClass}`}
          >
            {confirmText || t('confirm', language)}
          </button>
        </div>
      </div>
    </div>
  );
};
