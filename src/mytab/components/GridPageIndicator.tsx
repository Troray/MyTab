import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GridPage, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';

interface GridPageIndicatorProps {
  gridPages: GridPage[];
  activeGridPageId: string;
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  onSelectPage: (pageId: string) => void;
  onAddPage?: (name?: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onDeletePage: (pageId: string) => void;
}

export const GridPageIndicator: React.FC<GridPageIndicatorProps> = ({
  gridPages,
  activeGridPageId,
  settings,
  resolvedColors,
  isLight = false,
  onSelectPage,
  onRenamePage,
  onDeletePage,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    page: GridPage;
    x: number;
    y: number;
  } | null>(null);
  const [renamingPage, setRenamingPage] = useState<GridPage | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [deletingPage, setDeletingPage] = useState<GridPage | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on click outside or Esc
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, page: GridPage) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 150;
    const menuHeight = 90;
    const x = Math.max(8, Math.min(e.clientX - menuWidth / 2, window.innerWidth - menuWidth - 8));
    const y = e.clientY > window.innerHeight - 130
      ? Math.max(8, e.clientY - menuHeight - 8)
      : Math.min(e.clientY + 4, window.innerHeight - menuHeight - 8);
    setContextMenu({ page, x, y });
  };

  const startRename = (page: GridPage) => {
    setRenamingPage(page);
    setRenameInput(page.name);
    setContextMenu(null);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingPage) return;
    const trimmed = renameInput.trim();
    if (trimmed) {
      onRenamePage(renamingPage.id, trimmed);
    }
    setRenamingPage(null);
  };

  const activeIndex = Math.max(
    0,
    gridPages.findIndex((p) => p.id === activeGridPageId)
  );

  if (typeof document === 'undefined') return null;

  return (
    <>
      {/* Frosted Floating Pill Capsule Portaled to document.body */}
      {createPortal(
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 select-none z-40 pointer-events-none">
          <div
            className={`pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all duration-300 ease-out ${
              contextMenu || renamingPage || deletingPage
                ? 'opacity-100 scale-100 shadow-xl'
                : 'opacity-35 hover:opacity-100 hover:scale-105 hover:shadow-2xl'
            } ${
              isLight
                ? 'bg-white/80 hover:bg-white/95 border-black/10 text-slate-800 shadow-black/10'
                : 'bg-black/45 hover:bg-black/70 border-white/15 text-white shadow-black/40'
            }`}
          >
            {/* Previous page arrow (if multiple pages) */}
            {gridPages.length > 1 && (
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => {
                  if (activeIndex > 0) {
                    onSelectPage(gridPages[activeIndex - 1].id);
                  }
                }}
                className={`p-1 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
                title={t('prevPage', settings.language)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Page Dots / Pills */}
            <div className="flex items-center gap-1.5">
              {gridPages.map((page, idx) => {
                const isActive = page.id === activeGridPageId;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => onSelectPage(page.id)}
                    onContextMenu={(e) => handleContextMenu(e, page)}
                    title={page.name || `${t('defaultDesktopName', settings.language)} ${idx + 1}`}
                    className="relative group p-1 transition-all duration-300 cursor-pointer focus:outline-none flex items-center justify-center"
                  >
                    <span
                      className={`block transition-all duration-300 ${
                        isActive
                          ? isLight
                            ? 'w-6 h-2 rounded-full bg-slate-900 shadow-sm'
                            : 'w-6 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                          : isLight
                          ? 'w-2 h-2 rounded-full bg-slate-400 group-hover:bg-slate-700 group-hover:scale-125'
                          : 'w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/80 group-hover:scale-125'
                      }`}
                    />
                    {/* Active Tooltip */}
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white shadow-lg backdrop-blur-md z-50 border border-white/10">
                      {page.name || `${t('defaultDesktopName', settings.language)} ${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Next page arrow (if multiple pages) */}
            {gridPages.length > 1 && (
              <button
                type="button"
                disabled={activeIndex === gridPages.length - 1}
                onClick={() => {
                  if (activeIndex < gridPages.length - 1) {
                    onSelectPage(gridPages[activeIndex + 1].id);
                  }
                }}
                className={`p-1 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
                title={t('nextPage', settings.language)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Context Menu for Page Portaled Directly to document.body (Outside transform container!) */}
      {contextMenu &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className={`glass-dropdown fixed z-[9999] min-w-[150px] py-1.5 px-1 rounded-xl border shadow-2xl animate-scale-in text-xs font-medium overflow-hidden select-none ${
              isLight
                ? 'border-black/10 shadow-black/15 text-slate-800'
                : 'border-white/15 shadow-black/50 text-white'
            }`}
          >
            <div className={`px-3 py-1 text-[10px] font-semibold truncate ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
              {contextMenu.page.name || `${t('defaultDesktopName', settings.language)}`}
            </div>

            <button
              type="button"
              onClick={() => startRename(contextMenu.page)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Pencil className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{t('renameDesktopPage', settings.language)}</span>
            </button>

            {gridPages.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setDeletingPage(contextMenu.page);
                  setContextMenu(null);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-colors cursor-pointer text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>{t('deleteDesktopPage', settings.language)}</span>
              </button>
            )}
          </div>,
          document.body
        )}

      {/* Rename Dialog Modal Portaled Directly to document.body (Outside transform container!) */}
      {renamingPage &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto">
            <div
              className={`fixed inset-0 transition-opacity ${isLight ? 'bg-black/30' : 'bg-black/60'}`}
              onClick={() => setRenamingPage(null)}
            />
            <div
              className={`glass-modal relative z-10 w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
                isLight ? 'border-black/10 text-slate-900' : 'border-white/15 text-white'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <h3 className="text-sm font-semibold tracking-tight">
                  {t('renameDesktopPage', settings.language)}
                </h3>
                <button
                  type="button"
                  onClick={() => setRenamingPage(null)}
                  className={`p-1 rounded-xl transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-black/10 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRenameSubmit} className="space-y-4">
                <input
                  type="text"
                  autoFocus
                  required
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder={t('pageNamePlaceholder', settings.language)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenamingPage(null)}
                    className="glass-btn-ghost px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    {t('cancel', settings.language)}
                  </button>
                  <button
                    type="submit"
                    className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-medium active:scale-95 cursor-pointer"
                  >
                    {t('save', settings.language)}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPage)}
        title={t('deleteDesktopPage', settings.language)}
        message={t('confirmDeletePage', settings.language)}
        confirmText={t('deleteDesktopPage', settings.language)}
        cancelText={t('cancel', settings.language)}
        onConfirm={() => {
          if (deletingPage) {
            onDeletePage(deletingPage.id);
            setDeletingPage(null);
          }
        }}
        onCancel={() => setDeletingPage(null)}
        isLight={isLight}
      />
    </>
  );
};
