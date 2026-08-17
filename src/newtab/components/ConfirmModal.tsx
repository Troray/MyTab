import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, DownloadCloud, AlertCircle, X } from 'lucide-react';
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
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
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
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/20">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/20">
            <DownloadCloud className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
    }
  };

  const confirmBtnClass =
    type === 'danger'
      ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30'
      : type === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/30'
      : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Frosted Glass Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/20 shadow-2xl p-6 overflow-hidden animate-scale-in text-white"
        style={{
          background: 'rgba(18, 18, 30, 0.85)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {renderIcon()}

          <div className="space-y-1.5 px-2">
            <h3 className="text-base font-semibold tracking-wide text-white drop-shadow-sm">
              {title}
            </h3>
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium border border-white/15 transition-all cursor-pointer"
            >
              {cancelText || t('cancel', language)}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-medium transition-all cursor-pointer ${confirmBtnClass}`}
            >
              {confirmText || (language === 'zh-CN' ? '确认' : 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
