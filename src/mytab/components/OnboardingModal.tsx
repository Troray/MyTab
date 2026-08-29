import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Compass, Cloud, Globe } from 'lucide-react';
import { ThemeSettings } from '../../types';
import { t } from '../../utils/i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  settings: ThemeSettings;
  onFinish: () => void;
  onOpenSettings: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  settings,
  onFinish,
  onOpenSettings,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Compass className="w-7 h-7 text-amber-400" />,
      title: '极简 · 高效 · 定制',
      desc: t('onboardingStep1', settings.language),
    },
    {
      icon: <Sparkles className="w-7 h-7 text-amber-400" />,
      title: '智能图标与标题匹配',
      desc: t('onboardingStep2', settings.language),
    },
    {
      icon: <Cloud className="w-7 h-7 text-amber-400" />,
      title: '私有安全 · WebDAV & Git 云同步',
      desc: t('onboardingStep3', settings.language),
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="glass-modal relative w-full max-w-md p-8 rounded-3xl border border-white/15 shadow-2xl text-white text-center animate-scale-in"
      >
        {/* Step Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.08] flex items-center justify-center border border-white/10 shadow-inner">
          {current.icon}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step ? 'w-6 bg-white' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-2 tracking-tight">{current.title}</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-8 px-2">{current.desc}</p>

        {/* Action Button */}
        <div className="flex items-center justify-center gap-3">
          {step === steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 font-semibold text-sm text-slate-950 shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('onboardingStart', settings.language)}</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 font-semibold text-sm text-white border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('onboardingNext', settings.language)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
