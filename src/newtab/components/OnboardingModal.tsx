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
      icon: <Compass className="w-8 h-8 text-indigo-400" />,
      title: '极简 · 高效 · 定制',
      desc: t('onboardingStep1', settings.language),
    },
    {
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      title: '智能图标与标题匹配',
      desc: t('onboardingStep2', settings.language),
    },
    {
      icon: <Cloud className="w-8 h-8 text-sky-400" />,
      title: '私有安全 · WebDAV 云同步',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md p-8 rounded-3xl border border-white/15 shadow-2xl text-white text-center animate-scale-in"
        style={{
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        {/* Step Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 shadow-inner">
          {current.icon}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step ? 'w-6 bg-indigo-500' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-2 tracking-wide">{current.title}</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-8 px-2">{current.desc}</p>

        {/* Action Button */}
        <div className="flex items-center justify-center gap-3">
          {step === steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm text-white shadow-lg shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('onboardingStart', settings.language)}</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-white/15 hover:bg-white/25 font-semibold text-sm text-white border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>下一步</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
