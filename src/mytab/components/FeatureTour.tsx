import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  MousePointerClick,
  Sparkles,
  Columns3,
  MoveRight,
  LayoutList,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';
import { Locale } from '../../types';
import { t } from '../../utils/i18n';

export interface FeatureTourProps {
  layoutMode: 'grid' | 'board' | 'list';
  language: Locale;
  onFinish: () => void;
}

interface TourStep {
  target: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
}

// Pure helper to get tour steps for any layout mode
const getTourSteps = (layoutMode: 'grid' | 'board' | 'list'): TourStep[] => {
  if (layoutMode === 'board') {
    return [
      {
        target: '[data-tour="board-column"]',
        titleKey: 'tourBoardStep1Title',
        descKey: 'tourBoardStep1Desc',
        icon: <Columns3 className="w-5 h-5 text-white" />,
      },
      {
        target: '[data-tour="board-card"]',
        titleKey: 'tourBoardStep2Title',
        descKey: 'tourBoardStep2Desc',
        icon: <MoveRight className="w-5 h-5 text-sky-400" />,
      },
    ];
  }

  if (layoutMode === 'list') {
    return [
      {
        target: '[data-tour="header-widgets"]',
        titleKey: 'tourListStep1Title',
        descKey: 'tourListStep1Desc',
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      },
      {
        target: '[data-tour="list-item"]',
        titleKey: 'tourListStep2Title',
        descKey: 'tourListStep2Desc',
        icon: <LayoutList className="w-5 h-5 text-white" />,
      },
    ];
  }

  // Default: 'grid' (FreeCanvas / Grid Mode)
  // 1. Header Tools (快捷控制台)
  // 2. Header Edit (自由布局编辑 - swapped with step 3)
  // 3. Site Card (快捷方式卡片 - swapped with step 2)
  // 4. Grid Page Indicator (多桌面管理 - new step 4)
  return [
    {
      target: '[data-tour="header-tools"]',
      titleKey: 'tourGridStep1Title',
      descKey: 'tourGridStep1Desc',
      icon: <Compass className="w-5 h-5 text-white" />,
    },
    {
      target: '[data-tour="header-edit"]',
      titleKey: 'tourGridStep2Title',
      descKey: 'tourGridStep2Desc',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    },
    {
      target: '[data-tour="site-card"]',
      titleKey: 'tourGridStep3Title',
      descKey: 'tourGridStep3Desc',
      icon: <MousePointerClick className="w-5 h-5 text-sky-400" />,
    },
    {
      target: '[data-tour="grid-page-indicator"]',
      titleKey: 'tourGridStep4Title',
      descKey: 'tourGridStep4Desc',
      icon: <Layers className="w-5 h-5 text-purple-400" />,
    },
  ];
};

// Pure helper to measure bounding geometry of a tour target
const measureTarget = (
  targetSelector?: string
): { top: number; left: number; width: number; height: number } | null => {
  if (!targetSelector || typeof document === 'undefined') return null;
  const el = document.querySelector(targetSelector);
  if (!el) return null;

  let rect = el.getBoundingClientRect();

  // For header-widgets, compute the tight union bounding box of active child widgets
  if (targetSelector === '[data-tour="header-widgets"]') {
    const items = el.querySelectorAll('.grid-stack-item');
    if (items.length > 0) {
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;
      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          minLeft = Math.min(minLeft, r.left);
          minTop = Math.min(minTop, r.top);
          maxRight = Math.max(maxRight, r.right);
          maxBottom = Math.max(maxBottom, r.bottom);
        }
      });
      if (minLeft < maxRight && minTop < maxBottom) {
        rect = {
          top: minTop,
          left: minLeft,
          width: maxRight - minLeft,
          height: maxBottom - minTop,
          bottom: maxBottom,
          right: maxRight,
        } as DOMRect;
      }
    }
  }

  // Ensure target has non-zero geometry
  if (rect.width <= 0 && rect.height <= 0) return null;

  const pad =
    targetSelector === '[data-tour="grid-page-indicator"]'
      ? 8
      : targetSelector === '[data-tour="header-widgets"]'
      ? 12
      : 6;

  return {
    top: Math.max(0, rect.top - pad),
    left: Math.max(0, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
};

export const FeatureTour: React.FC<FeatureTourProps> = ({
  layoutMode,
  language,
  onFinish,
}) => {
  const steps = useMemo(() => getTourSteps(layoutMode), [layoutMode]);
  const [step, setStep] = useState(0);
  const totalSteps = steps.length;
  const currentStep = steps[step] || steps[0];

  // Measure initial target synchronously so Frame 0 never renders at (50%, 50%)!
  const [targetRect, setTargetRect] = useState(() => measureTarget(currentStep?.target));
  const [showFallback, setShowFallback] = useState(false);

  // Measure and update target bounding rect
  const updateTargetRect = useCallback(() => {
    if (!currentStep) return;
    const rect = measureTarget(currentStep.target);
    if (rect) {
      setTargetRect(rect);
    }
  }, [currentStep]);

  // Synchronous layout effect before paint to prevent any FOUC or flash
  React.useLayoutEffect(() => {
    const rect = measureTarget(currentStep?.target);
    if (rect) {
      setTargetRect(rect);
    }
  }, [currentStep?.target, step]);

  useEffect(() => {
    // If targetRect couldn't be measured initially, allow a short timeout before falling back to center
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    if (!targetRect) {
      fallbackTimer = setTimeout(() => {
        setShowFallback(true);
      }, 150);
    } else {
      setShowFallback(false);
    }

    // Re-check shortly in case DOM transitions or lazy portals finish mounting
    const timer1 = setTimeout(updateTargetRect, 60);
    const timer2 = setTimeout(updateTargetRect, 200);

    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [updateTargetRect, step, targetRect]);

  // Keyboard navigation: Escape to skip/finish, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onFinish();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (step < totalSteps - 1) {
          setStep((prev) => prev + 1);
        } else {
          onFinish();
        }
      } else if (e.key === 'ArrowLeft' && step > 0) {
        setStep((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, totalSteps, onFinish]);

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  // Compute Popover Position relative to targetRect
  const popoverStyle = useMemo<React.CSSProperties>(() => {
    const cardWidth = 360;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (!targetRect) {
      if (!showFallback) {
        return {
          opacity: 0,
          pointerEvents: 'none',
        };
      }
      // Centered fallback only when element truly not found after grace period
      return {
        top: '50%',
        bottom: 'auto',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    // Horizontal placement: align center with target, clamped within screen margins
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    left = Math.max(16, Math.min(left, viewportWidth - cardWidth - 16));

    // Vertical placement:
    // When target is near bottom or is the bottom grid-page-indicator, place above with comfortable clearance
    const spaceBelow = viewportHeight - (targetRect.top + targetRect.height);
    const isBottomElement = currentStep?.target === '[data-tour="grid-page-indicator"]';
    const placeAbove = isBottomElement || spaceBelow < 340;

    if (placeAbove) {
      // Anchored strictly to the TOP of the spotlight cutout so it ALWAYS floats cleanly above without overlapping!
      const bottom = Math.max(16, viewportHeight - targetRect.top + 24);
      return {
        top: 'auto',
        bottom: `${bottom}px`,
        left: `${left}px`,
        transform: 'none',
      };
    }

    return {
      top: `${targetRect.top + targetRect.height + 20}px`,
      bottom: 'auto',
      left: `${left}px`,
      transform: 'none',
    };
  }, [targetRect, currentStep, showFallback]);

  const isPill = currentStep?.target === '[data-tour="grid-page-indicator"]';

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-auto select-none">
      {/* 1. Backdrop Overlay with Spotlight cutout via huge box-shadow */}
      {targetRect ? (
        <div
          className={`fixed pointer-events-none transition-all duration-300 ease-out ring-2 ring-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.68),0_0_24px_rgba(255,255,255,0.22)] ${
            isPill ? 'rounded-full' : 'rounded-2xl'
          }`}
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        />
      ) : (
        <div
          className={`fixed inset-0 bg-black/68 backdrop-blur-[1px] transition-opacity duration-300 ${
            !showFallback ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* 2. Frosted Glass Guided Tooltip Popover */}
      <div
        style={popoverStyle}
        className={`fixed z-[9995] w-[360px] max-w-[calc(100vw-32px)] bg-neutral-950/92 backdrop-blur-2xl border border-white/12 text-white rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.65)] p-5 transition-[top,left,bottom,transform,opacity] duration-300 ease-out ${
          !targetRect && !showFallback
            ? 'opacity-0 pointer-events-none scale-95'
            : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-200'
        }`}
      >
        {/* Header: Icon, Step Counter, Close Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/12 shrink-0">
              {currentStep.icon}
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 tracking-wider border border-white/10">
              {step + 1} / {totalSteps}
            </span>
          </div>

          <button
            onClick={onFinish}
            title={t('tourSkip', language)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Title & Bullet Points Description */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-white tracking-tight mb-2">
            {t(currentStep.titleKey as any, language)}
          </h4>
          {(() => {
            const rawText = t(currentStep.descKey as any, language);
            const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
            const isBulletList = lines.length > 1 || lines[0]?.startsWith('- ') || lines[0]?.startsWith('• ');

            if (isBulletList) {
              return (
                <ul className="text-xs text-neutral-300 space-y-1.5">
                  {lines.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-white/40 shrink-0 text-xs select-none leading-relaxed">•</span>
                      <span className="flex-1 text-neutral-300">{line.replace(/^[•\-\*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                {rawText}
              </p>
            );
          })()}
        </div>

        {/* Footer: Step Dots and Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-white/25'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {totalSteps > 1 && (
              <button
                onClick={onFinish}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {t('tourSkip', language)}
              </button>
            )}

            {step > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1 text-xs text-neutral-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{t('tourPrev', language)}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {step === totalSteps - 1
                  ? t('tourGotIt', language)
                  : t('tourNext', language)}
              </span>
              {step === totalSteps - 1 ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
