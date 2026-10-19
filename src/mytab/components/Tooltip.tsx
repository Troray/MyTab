import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ActiveTooltip {
  text: string;
  x: number;
  y: number;
}

export const Tooltip: React.FC = React.memo(() => {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-tooltip]') as HTMLElement | null;
      if (!target) {
        clearTimer();
        setActiveTooltip(null);
        return;
      }

      const text = target.getAttribute('data-tooltip')?.trim();
      if (!text) {
        clearTimer();
        setActiveTooltip(null);
        return;
      }

      mousePosRef.current = { x: e.clientX, y: e.clientY };
      clearTimer();

      // Smooth 160ms delay to prevent flashing while quickly moving cursor
      timerRef.current = setTimeout(() => {
        setActiveTooltip({
          text,
          x: mousePosRef.current.x,
          y: mousePosRef.current.y,
        });
      }, 160);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !related.closest?.('[data-tooltip]')) {
        clearTimer();
        setActiveTooltip(null);
      }
    };

    const handleDismiss = () => {
      clearTimer();
      setActiveTooltip(null);
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('dragstart', handleDismiss, true);
    window.addEventListener('mousedown', handleDismiss, true);

    return () => {
      clearTimer();
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('dragstart', handleDismiss, true);
      window.removeEventListener('mousedown', handleDismiss, true);
    };
  }, []);

  if (!activeTooltip || typeof document === 'undefined') return null;

  const { text, x, y } = activeTooltip;
  // Default to popping up below the mouse pointer; flip above only if close to bottom viewport edge
  const showAbove = y > window.innerHeight - 80;
  const top = showAbove ? y - 14 : y + 22;
  const left = Math.max(50, Math.min(window.innerWidth - 180, x));

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        transform: showAbove ? 'translate(-33.33%, -100%)' : 'translate(-33.33%, 0)',
        zIndex: 99999,
        backgroundColor: '#2d2d2d',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
      }}
      className="pointer-events-none px-2.5 py-1 rounded-lg text-white text-[11px] font-medium tracking-tight max-w-xs text-center leading-normal break-words select-none animate-fade-in"
    >
      {text}
    </div>,
    document.body
  );
});

