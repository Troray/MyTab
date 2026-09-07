import React, { useState, useEffect, useCallback } from 'react';
import {
  Bookmark,
  Palette,
  Sliders,
  Clock,
  ShieldCheck,
  Cloud,
  DownloadCloud,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';
import { ThemeSettings } from '../../types';
import { t } from '../../utils/i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  settings: ThemeSettings;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  settings,
  onFinish,
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      id: 'bookmarks',
      icon: <Bookmark className="w-6 h-6 text-amber-400" />,
      iconBg: 'bg-amber-400/10 border-amber-400/25 text-amber-400',
      titleKey: 'onboardingStep1Title',
      descKey: 'onboardingStep1',
      tagsKey: 'onboardingStep1Tags',
    },
    {
      id: 'wallpapers',
      icon: <Palette className="w-6 h-6 text-sky-400" />,
      iconBg: 'bg-sky-400/10 border-sky-400/25 text-sky-400',
      titleKey: 'onboardingStep2Title',
      descKey: 'onboardingStep2',
      tagsKey: 'onboardingStep2Tags',
    },
    {
      id: 'customization',
      icon: <Sliders className="w-6 h-6 text-emerald-400" />,
      iconBg: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400',
      titleKey: 'onboardingStep3Title',
      descKey: 'onboardingStep3',
      tagsKey: 'onboardingStep3Tags',
    },
    {
      id: 'preferences',
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      iconBg: 'bg-indigo-400/10 border-indigo-400/25 text-indigo-400',
      titleKey: 'onboardingStep4Title',
      descKey: 'onboardingStep4',
      tagsKey: 'onboardingStep4Tags',
    },
    {
      id: 'private',
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      iconBg: 'bg-amber-400/10 border-amber-400/25 text-amber-400',
      titleKey: 'onboardingStep5Title',
      descKey: 'onboardingStep5',
      tagsKey: 'onboardingStep5Tags',
    },
    {
      id: 'sync',
      icon: <Cloud className="w-6 h-6 text-blue-400" />,
      iconBg: 'bg-blue-400/10 border-blue-400/25 text-blue-400',
      titleKey: 'onboardingStep6Title',
      descKey: 'onboardingStep6',
      tagsKey: 'onboardingStep6Tags',
    },
    {
      id: 'backup',
      icon: <DownloadCloud className="w-6 h-6 text-emerald-400" />,
      iconBg: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400',
      titleKey: 'onboardingStep7Title',
      descKey: 'onboardingStep7',
      tagsKey: 'onboardingStep7Tags',
    },
  ];

  const totalSteps = steps.length;
  const current = steps[step];
  const tags = (t(current.tagsKey as any, settings.language) || '').split('|').filter(Boolean);

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      onFinish();
    }
  }, [step, totalSteps, onFinish]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onFinish]);

  if (!isOpen) return null;

  const isLast = step === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in select-none">
      <div className="glass-modal relative w-full max-w-[430px] p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl text-white text-center animate-scale-in">
        {/* Top Header: Step Badge & Skip Button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono font-medium tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-white/75">
            {step + 1} / {totalSteps}
          </span>
          <button
            type="button"
            onClick={onFinish}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer active:scale-95"
            title={t('onboardingSkip', settings.language)}
          >
            <span>{t('onboardingSkip', settings.language)}</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Step Icon with Glowing Halo */}
        <div
          className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border shadow-lg transition-transform duration-300 transform hover:scale-105 ${current.iconBg}`}
        >
          {current.icon}
        </div>

        {/* Step Indicators (Clickable) */}
        <div className="flex justify-center items-center gap-1.5 mb-4">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === step
                  ? 'w-6 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`${idx + 1} / ${totalSteps}`}
            />
          ))}
        </div>

        {/* Content Title & Description */}
        <div className="min-h-[145px] flex flex-col items-center justify-start">
          <h3 className="text-lg font-bold mb-2 tracking-tight text-white drop-shadow-sm">
            {t(current.titleKey as any, settings.language)}
          </h3>
          <p className="text-xs text-white/70 leading-relaxed px-2 mb-3.5">
            {t(current.descKey as any, settings.language)}
          </p>

          {/* Structured Feature Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-white/[0.08] border border-white/12 text-white/90 shadow-sm backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center justify-between gap-2.5 pt-3 border-t border-white/10">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 font-medium text-xs text-white border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('onboardingPrev', settings.language)}</span>
            </button>
          ) : (
            <div className="hidden sm:block flex-1" />
          )}

          <button
            type="button"
            onClick={handleNext}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              isLast
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-950 shadow-black/20'
            }`}
          >
            <span>{isLast ? t('onboardingStart', settings.language) : t('onboardingNext', settings.language)}</span>
            {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
